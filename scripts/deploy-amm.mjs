import {
  Keypair,
  Networks,
  TransactionBuilder,
  Address,
  Contract,
  Operation,
  rpc,
  hash,
  xdr,
  StrKey,
  nativeToScVal,
} from "@stellar/stellar-sdk";
import { readFileSync } from "fs";

const SECRET = process.env.ADMIN_SECRET;
if (!SECRET) throw new Error("Set ADMIN_SECRET env var");

const kp = Keypair.fromSecret(SECRET);
const adminPub = kp.publicKey();

const server = new rpc.Server("https://soroban-testnet.stellar.org", { allowHttp: false });

const WASM_PATH = "contracts/liquidity_pool/target/wasm32v1-none/release/liquidity_pool.wasm";
const XLM_SAC = "CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC";
const USDC_SAC = "CAZRY5GSFBFXD7H6GAFBA5YGYQTDXU4QKWKMYFWBAZFUCURN3WKX6LF5";

async function sendAndWait(tx, label) {
  let prepared;
  try { prepared = await server.prepareTransaction(tx); }
  catch (e) { throw new Error(`${label} prepare failed: ${e.message}`); }
  prepared.sign(kp);
  const resp = await server.sendTransaction(prepared);
  if (resp.status !== "PENDING") throw new Error(`${label} rejected: ${JSON.stringify(resp)}`);
  for (let i = 0; i < 180; i++) {
    await new Promise((r) => setTimeout(r, 2000));
    const r = await server.getTransaction(resp.hash);
    if (r.status === "SUCCESS") { console.log(`  [${label}] ok (~${i + 1}s)`); return r; }
    if (r.status === "FAILED") throw new Error(`${label} FAILED on-chain`);
  }
  throw new Error(`${label} polling timeout`);
}

function deriveContractId(adminPub, salt, networkId) {
  const preimageAddr = xdr.ContractIdPreimage.contractIdPreimageFromAddress(
    new xdr.ContractIdPreimageFromAddress({
      address: new Address(adminPub).toScAddress(),
      salt,
    })
  );
  const fullPreimage = xdr.HashIdPreimage.envelopeTypeContractId(
    new xdr.HashIdPreimageContractId({
      networkId,
      envelopeId: new xdr.Uint64("0"),
      contractIdPreimage: preimageAddr,
    })
  );
  return StrKey.encodeContract(hash(fullPreimage.toXDR()));
}

async function main() {
  console.log("Admin:", adminPub, "\n");

  const wasm = readFileSync(WASM_PATH);
  const wasmHash = hash(wasm);
  console.log("WASM hash:", wasmHash.toString("hex"));

  // Stable salt by default (admin-only call); set CONTRACT_SALT=<hex> to force a fresh address.
  const salt = process.env.CONTRACT_SALT
    ? Buffer.from(process.env.CONTRACT_SALT, "hex")
    : hash(Buffer.from(adminPub, "utf-8"));
  if (salt.length !== 32) throw new Error("CONTRACT_SALT must be 32-byte hex");
  const networkId = hash(Buffer.from(Networks.TESTNET, "utf-8"));
  const contractStrKey = deriveContractId(adminPub, salt, networkId);
  const contract = new Contract(contractStrKey);
  console.log("\nTarget contract ID:", contractStrKey);

  // 1 — Upload WASM (idempotent — second run will fail with existing error, OK to skip)
  console.log("\n[1/4] Upload WASM");
  try {
    const acct1 = await server.getAccount(adminPub);
    const uploadTx = new TransactionBuilder(acct1, {
      fee: "100000", networkPassphrase: Networks.TESTNET,
    })
      .addOperation(Operation.uploadContractWasm({ wasm }))
      .setTimeout(120).build();
    await sendAndWait(uploadTx, "upload");
  } catch (e) {
    console.log("  upload skipped:", String(e.message).split("\n")[0]);
  }

  // 2 — Create contract (skips if already exists)
  console.log("\n[2/4] Create contract (if missing)");
  try {
    const acct2 = await server.getAccount(adminPub);
    const createTx = new TransactionBuilder(acct2, {
      fee: "100000", networkPassphrase: Networks.TESTNET,
    })
      .addOperation(Operation.createCustomContract({
        address: new Address(adminPub), wasmHash, salt, constructorArgs: [],
      }))
      .setTimeout(120).build();
    await sendAndWait(createTx, "create");
  } catch (e) {
    console.log("  create skipped (already exists or other):", String(e.message).split("\n")[0]);
  }

  // 3 — Initialize (skips if already initialized)
  console.log("\n[3/4] Initialize");
  try {
    const acct3 = await server.getAccount(adminPub);
    const initTx = new TransactionBuilder(acct3, {
      fee: "100000", networkPassphrase: Networks.TESTNET,
    })
      .addOperation(
        contract.call(
          "initialize",
          new Address(adminPub).toScVal(),
          new Contract(XLM_SAC).address().toScVal(),
          new Contract(USDC_SAC).address().toScVal(),
        )
      )
      .setTimeout(120).build();
    await sendAndWait(initTx, "initialize");
  } catch (e) {
    console.log("  initialize skipped:", String(e.message).split("\n")[0]);
  }

  // 4 — Seed liquidity
  console.log("\n[4/4] Seed liquidity (500 XLM / 85 USDC)");
  try {
    const acct4 = await server.getAccount(adminPub);
    const liqTx = new TransactionBuilder(acct4, {
      fee: "100000", networkPassphrase: Networks.TESTNET,
    })
      .addOperation(
        contract.call(
          "add_liquidity",
          new Address(adminPub).toScVal(),
          nativeToScVal(BigInt(5000000000), { type: "i128" }),
          nativeToScVal(BigInt(850000000), { type: "i128" }),
          nativeToScVal(BigInt(0), { type: "i128" }),
        )
      )
      .setTimeout(120).build();
    await sendAndWait(liqTx, "add_liquidity");
  } catch (e) {
    console.log("  liquidity skipped:", String(e.message || e).split("\n")[0]);
  }

  console.log("\n=== DONE ===");
  console.log(`NEXT_PUBLIC_AMM_CONTRACT_ID=${contractStrKey}`);
}

main().catch((e) => { console.error("FATAL:", e); process.exit(1); });
