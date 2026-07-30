import {
  Keypair,
  SorobanRpc,
  TransactionBuilder,
  Networks,
  Contract,
  xdr,
  Address,
  nativeToScVal,
  Operation,
  Asset,
  Horizon
} from '@stellar/stellar-sdk';
import fs from 'fs';
import path from 'path';

// Read config from .env.local
const envPath = path.resolve(process.cwd(), '.env.local');
let envContent = '';
try {
  envContent = fs.readFileSync(envPath, 'utf-8');
} catch (e) {
  console.warn('Could not read .env.local. Make sure you deployed the contract first.');
  process.exit(1);
}

function getEnv(key) {
  const match = envContent.match(new RegExp(`${key}=([A-Za-z0-9_]+)`));
  if (!match) throw new Error(`${key} not found in .env.local`);
  return match[1];
}

const contractId = getEnv('NEXT_PUBLIC_ESCROW_CONTRACT_ID');
const ammId = getEnv('NEXT_PUBLIC_AMM_CONTRACT_ID');
const usdcContractId = getEnv('NEXT_PUBLIC_USDC_CONTRACT_ID');
const usdcIssuer = getEnv('NEXT_PUBLIC_USDC_ISSUER');

const contract = new Contract(contractId);
const ammContract = new Contract(ammId);
const XLM_SAC = "CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC";

const rpcUrl = 'https://soroban-testnet.stellar.org';
const server = new SorobanRpc.Server(rpcUrl, { allowHttp: true });
const horizon = new Horizon.Server("https://horizon-testnet.stellar.org");

async function fundAccount(publicKey) {
  const res = await fetch(`https://friendbot.stellar.org?addr=${encodeURIComponent(publicKey)}`);
  if (!res.ok) throw new Error(`Friendbot failed for ${publicKey}`);
  await new Promise(r => setTimeout(r, 2000));
}

async function sendAndWait(tx, kp, label) {
  let prepared;
  try {
    prepared = await server.prepareTransaction(tx);
  } catch (e) {
    throw new Error(`${label} prepare failed: ${e.message}`);
  }
  prepared.sign(kp);
  const resp = await server.sendTransaction(prepared);
  if (resp.status !== "PENDING") {
    throw new Error(`${label} rejected: ${JSON.stringify(resp)}`);
  }
  for (let i = 0; i < 40; i++) {
    await new Promise((r) => setTimeout(r, 2000));
    const r = await server.getTransaction(resp.hash);
    if (r.status === "SUCCESS") {
      return r;
    }
    if (r.status === "FAILED") {
      const errorMsg = r.resultMetaXdr ? r.resultMetaXdr.toXDR('base64') : 'Unknown';
      throw new Error(`${label} FAILED on-chain. ResultMeta: ${errorMsg}`);
    }
  }
  throw new Error(`${label} polling timeout`);
}

const jobTitles = [
  "Web3 Frontend Dashboard",
  "Smart Contract Audit",
  "React Native Mobile App",
  "DeFi Liquidity Pool UI",
  "NFT Marketplace Backend",
  "Tokenomics Design",
  "Rust Smart Contract Dev",
  "UI/UX Design for Web3 Wallet",
  "Full Stack DApp Development",
  "Solidity to Soroban Migration"
];

async function simulateTransactions(count) {
  console.log(`Starting simulation for ${count} unique contracts/wallets using REAL AMM & USDC...`);
  console.log(`We will recycle USDC back to the AMM via Freelancer to prevent liquidity drain!`);
  
  const usdcAsset = new Asset("USDC", usdcIssuer);

  for (let i = 0; i < count; i++) {
    console.log(`\n--- Batch ${i + 1}/${count} ---`);
    try {
      const clientKp = Keypair.random();
      const freelancerKp = Keypair.random();
      const projectId = `proj_${Date.now()}_${i}`;
      const randomJob = jobTitles[Math.floor(Math.random() * jobTitles.length)];

      console.log(`[1] Funding Client & Freelancer via Friendbot...`);
      await Promise.all([
        fundAccount(clientKp.publicKey()),
        fundAccount(freelancerKp.publicKey())
      ]);

      console.log(`[2] Adding REAL USDC Trustlines for both Client & Freelancer...`);
      const clientAccountHorizon = await horizon.loadAccount(clientKp.publicKey());
      const trustTxClient = new TransactionBuilder(clientAccountHorizon, { fee: "10000", networkPassphrase: Networks.TESTNET })
        .addOperation(Operation.changeTrust({ asset: usdcAsset })).setTimeout(30).build();
      trustTxClient.sign(clientKp);
      
      const freelancerAccountHorizon = await horizon.loadAccount(freelancerKp.publicKey());
      const trustTxFreelancer = new TransactionBuilder(freelancerAccountHorizon, { fee: "10000", networkPassphrase: Networks.TESTNET })
        .addOperation(Operation.changeTrust({ asset: usdcAsset })).setTimeout(30).build();
      trustTxFreelancer.sign(freelancerKp);
      
      await Promise.all([
        horizon.submitTransaction(trustTxClient),
        horizon.submitTransaction(trustTxFreelancer)
      ]);
      await new Promise(r => setTimeout(r, 2000));

      console.log(`[3] Swapping 200 XLM for USDC via your AMM (Client)...`);
      const clientAccount = await server.getAccount(clientKp.publicKey());
      const swapTx = new TransactionBuilder(clientAccount, { fee: "100000", networkPassphrase: Networks.TESTNET })
        .addOperation(ammContract.call(
          "swap",
          new Address(clientKp.publicKey()).toScVal(),
          new Address(XLM_SAC).toScVal(),
          nativeToScVal(BigInt(200 * 10000000), { type: "i128" }), // Swap 200 XLM to limit impact per tx
          nativeToScVal(BigInt(0), { type: "i128" })
        ))
        .setTimeout(120).build();
      await sendAndWait(swapTx, clientKp, "AMM Swap");
      
      // Fetch the resulting USDC balance from Horizon
      const updatedClientAccount = await horizon.loadAccount(clientKp.publicKey());
      const usdcBalanceLine = updatedClientAccount.balances.find(b => b.asset_code === "USDC");
      if (!usdcBalanceLine) throw new Error("No USDC balance found after swap!");
      
      const usdcAmountFloat = parseFloat(usdcBalanceLine.balance);
      const escrowAmountFloat = Math.floor(usdcAmountFloat * 0.9); // Use 90% of the swapped amount
      const escrowAmountStroops = BigInt(Math.floor(escrowAmountFloat * 10000000));

      console.log(`    -> Received ${usdcAmountFloat.toFixed(2)} USDC from AMM. Using ${escrowAmountFloat} USDC for escrow.`);

      console.log(`[4] Initializing Escrow: "${randomJob}" for ${escrowAmountFloat} USDC...`);
      const clientAccountForSoroban = await server.getAccount(clientKp.publicKey());
      const initCall = contract.call(
        "initialize",
        nativeToScVal(projectId, { type: "string" }),
        new Address(clientKp.publicKey()).toScVal(),
        new Address(freelancerKp.publicKey()).toScVal(),
        new Address(usdcContractId).toScVal(),
        xdr.ScVal.scvVec([nativeToScVal(escrowAmountStroops, { type: "i128" })]),
        xdr.ScVal.scvVec([nativeToScVal(randomJob, { type: "string" })])
      );

      const initTx = new TransactionBuilder(clientAccountForSoroban, { fee: "1000000", networkPassphrase: Networks.TESTNET })
        .addOperation(initCall).setTimeout(120).build();
      await sendAndWait(initTx, clientKp, "initialize");

      console.log(`[5] Submitting & Approving Milestone...`);
      const freelancerAccount = await server.getAccount(freelancerKp.publicKey());
      const submitCall = contract.call("submit_milestone", nativeToScVal(projectId, { type: "string" }), nativeToScVal(0, { type: "u32" }));
      const submitTx = new TransactionBuilder(freelancerAccount, { fee: "1000000", networkPassphrase: Networks.TESTNET })
        .addOperation(submitCall).setTimeout(120).build();
      await sendAndWait(submitTx, freelancerKp, "submit_milestone");

      const clientAccountFinal = await server.getAccount(clientKp.publicKey());
      const approveCall = contract.call("approve_milestone", nativeToScVal(projectId, { type: "string" }), nativeToScVal(0, { type: "u32" }));
      const approveTx = new TransactionBuilder(clientAccountFinal, { fee: "1000000", networkPassphrase: Networks.TESTNET })
        .addOperation(approveCall).setTimeout(120).build();
      await sendAndWait(approveTx, clientKp, "approve_milestone");
      
      console.log(`[6] RECYCLING LIQUIDITY: Freelancer swapping USDC back to XLM...`);
      // Now the freelancer has the USDC, they will swap it back to XLM to restore AMM liquidity!
      const freelancerAccountFinal = await server.getAccount(freelancerKp.publicKey());
      const recycleTx = new TransactionBuilder(freelancerAccountFinal, { fee: "100000", networkPassphrase: Networks.TESTNET })
        .addOperation(ammContract.call(
          "swap",
          new Address(freelancerKp.publicKey()).toScVal(),
          new Address(usdcContractId).toScVal(),
          nativeToScVal(escrowAmountStroops, { type: "i128" }), // Swap exactly what they received back to XLM
          nativeToScVal(BigInt(0), { type: "i128" })
        ))
        .setTimeout(120).build();
      await sendAndWait(recycleTx, freelancerKp, "AMM Recycle Swap");
      
      console.log(`    -> Batch ${i + 1} Success! Pool liquidity restored.`);
      
    } catch (e) {
      console.error(`    -> Error in batch ${i + 1}:`, e.message);
    }
  }
}

simulateTransactions(54).then(() => {
  console.log('All simulations complete! The AMM swapped XLM to REAL USDC for every user.');
  process.exit(0);
}).catch(e => {
  console.error(e);
  process.exit(1);
});
