import {
  Keypair,
  Asset,
  Operation,
  TransactionBuilder,
  Networks,
  Horizon,
} from "@stellar/stellar-sdk";

const SECRET = process.env.ADMIN_SECRET;
if (!SECRET) throw new Error("Set ADMIN_SECRET env var");

const kp = Keypair.fromSecret(SECRET);
const horizon = new Horizon.Server("https://horizon-testnet.stellar.org", { allowHttp: false });

// OLD issuer (will be removed).
const OLD_USDC = new Asset("USDC", "GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5");
// NEW issuer: GAHPYWLK6YRN7CVYZOO4H3VDRZ7PVF5UJGLZCSPAEIKJE2XSWF5LAGER
const NEW_USDC = new Asset("USDC", "GAHPYWLK6YRN7CVYZOO4H3VDRZ7PVF5UJGLZCSPAEIKJE2XSWF5LAGER");

async function submit(tx, label) {
  tx.sign(kp);
  const r = await horizon.submitTransaction(tx);
  console.log(label, "hash:", r.hash);
}

const acct = await horizon.loadAccount(kp.publicKey());

// 1) Drop the OLD USDC trustline by setting limit=0.
//    (Will fail with op_underfunded if balance>0; if so we just acknowledge.)
try {
  const tx = new TransactionBuilder(acct, {
    fee: "100", networkPassphrase: Networks.TESTNET,
  })
    .addOperation(Operation.changeTrust({ asset: OLD_USDC, limit: "0" }))
    .setTimeout(60).build();
  await submit(tx, "changeTrust(old limit=0)");
  acct.sequenceNumber = (await horizon.loadAccount(kp.publicKey())).sequenceNumber();
} catch (e) {
  console.log("Skipping old-trustline removal:", String(e?.response?.data?.extras?.result_codes?.operations ?? e.message));
}

// 2) Add the new USDC trustline.
const acct2 = await horizon.loadAccount(kp.publicKey());
const tx2 = new TransactionBuilder(acct2, {
  fee: "100", networkPassphrase: Networks.TESTNET,
})
  .addOperation(Operation.changeTrust({ asset: NEW_USDC, limit: "1000000000" }))
  .setTimeout(60).build();
await submit(tx2, "changeTrust(new limit=1B");

acct2.sequenceNumber = (await horizon.loadAccount(kp.publicKey())).sequenceNumber();

// Horizon line-item balances, only the ones we care about.
const final = await horizon.loadAccount(kp.publicKey());
const trustlines = []
  .concat(final.balances)
  .filter((b) => b.asset_type !== "native")
  .map((b) => ({ code: b.asset_code, issuer: b.asset_issuer, balance: b.balance }));
console.log("\nUSDC trustlines on admin:");
console.log(JSON.stringify(trustlines, null, 2));
console.log("\nNext: send 850 USDC (issuer GAHPYWLK6YRN7CVYZOO4H3VDRZ7PVF5UJGLZCSPAEIKJE2XSWF5LAGER) from Freighter to " + kp.publicKey());
