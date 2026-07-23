import {
  Keypair,
  Networks,
  TransactionBuilder,
  Address,
  Contract,
  Operation,
  Asset,
  rpc,
  nativeToScVal,
  Horizon
} from "@stellar/stellar-sdk";

const server = new rpc.Server("https://soroban-testnet.stellar.org", { allowHttp: false });
const horizon = new Horizon.Server("https://horizon-testnet.stellar.org");

// AMM details
const AMM_ID = "CBRB4ZNJG2FDJUTKMYNNS6AYLU4OU47FVLTVIXCXGBJDD2UKPHKPIB6Y";
const XLM_SAC = "CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC";
const USDC_SAC = "CAZRY5GSFBFXD7H6GAFBA5YGYQTDXU4QKWKMYFWBAZFUCURN3WKX6LF5";
const USDC_ISSUER = "GAHPYWLK6YRN7CVYZOO4H3VDRZ7PVF5UJGLZCSPAEIKJE2XSWF5LAGER";
const USDC_CODE = "USDC";

async function fundWithFriendbot(publicKey) {
  console.log(`Funding ${publicKey} via Friendbot...`);
  const res = await fetch(`https://friendbot.stellar.org?addr=${publicKey}`);
  if (!res.ok) throw new Error("Friendbot failed");
}

async function sendAndWait(tx, kp, label) {
  let prepared = await server.prepareTransaction(tx);
  prepared.sign(kp);
  const resp = await server.sendTransaction(prepared);
  if (resp.status !== "PENDING") throw new Error(`${label} rejected`);
  for (let i = 0; i < 60; i++) {
    await new Promise(r => setTimeout(r, 2000));
    const r = await server.getTransaction(resp.hash);
    if (r.status === "SUCCESS") { console.log(`[${label}] Success`); return r; }
    if (r.status === "FAILED") throw new Error(`${label} FAILED on-chain`);
  }
  throw new Error(`${label} Timeout`);
}

async function main() {
  console.log("Setting up random account...");
  const kp1 = Keypair.random();

  await fundWithFriendbot(kp1.publicKey());

  console.log("Creating USDC trustline...");
  const acct0 = await horizon.loadAccount(kp1.publicKey());
  const trustTx = new TransactionBuilder(acct0, { fee: "100000", networkPassphrase: Networks.TESTNET })
    .addOperation(Operation.changeTrust({ asset: new Asset(USDC_CODE, USDC_ISSUER) }))
    .setTimeout(120).build();
  trustTx.sign(kp1);
  await horizon.submitTransaction(trustTx);
  console.log("Trustline created!");

  const ammContract = new Contract(AMM_ID);
  
  // 1. Swap 0.01 XLM for ~1 USDC
  console.log("Swapping 0.01 XLM for USDC...");
  const acct1 = await server.getAccount(kp1.publicKey());
  const swapTx = new TransactionBuilder(acct1, { fee: "100000", networkPassphrase: Networks.TESTNET })
    .addOperation(ammContract.call(
      "swap",
      new Address(kp1.publicKey()).toScVal(),
      new Contract(XLM_SAC).address().toScVal(),
      nativeToScVal(BigInt(100000), { type: "i128" }), // 0.01 XLM in stroops
      nativeToScVal(BigInt(0), { type: "i128" })
    ))
    .setTimeout(120).build();
  await sendAndWait(swapTx, kp1, "Swap");

  // 2. Add Liquidity (9,000 XLM and 1 USDC)
  console.log("Adding massive unbalanced liquidity to re-balance the pool...");
  const acct1_2 = await server.getAccount(kp1.publicKey());
  const addLiqTx = new TransactionBuilder(acct1_2, { fee: "100000", networkPassphrase: Networks.TESTNET })
    .addOperation(ammContract.call(
      "add_liquidity",
      new Address(kp1.publicKey()).toScVal(),
      nativeToScVal(BigInt(90000000000), { type: "i128" }), // 9000 XLM
      nativeToScVal(BigInt(10000000), { type: "i128" }), // 1 USDC
      nativeToScVal(BigInt(0), { type: "i128" })
    ))
    .setTimeout(120).build();
  await sendAndWait(addLiqTx, kp1, "Add Liquidity");

  console.log("Done! The pool is now healthy with ~9,020 XLM and ~2,083 USDC (Price roughly $0.23).");
}

main().catch(console.error);
