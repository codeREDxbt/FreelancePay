import { Keypair, Server, TransactionBuilder, Networks, Asset, Operation } from "@stellar/stellar-sdk";

const server = new Server("https://horizon-testnet.stellar.org");

async function mintUSDC(targetPublicKey) {
  console.log("Starting testnet USDC minting process...");

  // 1. Create a new "Issuer" account
  const issuerKeypair = Keypair.random();
  console.log("Created new Issuer Account:", issuerKeypair.publicKey());

  // 2. Fund the issuer account with native XLM (so it can pay transaction fees)
  console.log("Funding Issuer account via friendbot...");
  await fetch(`https://friendbot.stellar.org?addr=${issuerKeypair.publicKey()}`);

  // 3. Define the custom USDC asset
  const usdcAsset = new Asset("USDC", issuerKeypair.publicKey());
  
  console.log("\n================================================");
  console.log("SUCCESS! Here is your new USDC Issuer ID:");
  console.log(issuerKeypair.publicKey());
  console.log("================================================\n");

  console.log(`Sending 1,000 USDC to your wallet (${targetPublicKey})...`);
  
  try {
    // 4. Load the target account to see if trustline exists
    const targetAccount = await server.loadAccount(targetPublicKey);
    const hasTrustline = targetAccount.balances.some(b => b.asset_code === "USDC" && b.asset_issuer === issuerKeypair.publicKey());

    if (!hasTrustline) {
      console.log("\n⚠️ IMPORTANT ACTION REQUIRED ⚠️");
      console.log("Your wallet does not trust this new Issuer yet. Because you hold the private key to your wallet, the script cannot force-add the trustline for you.");
      console.log("\nPlease do the following:");
      console.log("1. Open Freighter");
      console.log(`2. Paste this EXACT issuer ID into the Add Asset / Search bar: ${issuerKeypair.publicKey()}`);
      console.log("3. Add the asset (establishing the trustline).");
      console.log("4. RUN THIS SCRIPT AGAIN to receive your 1,000 USDC!");
      return;
    }

    // 5. If trustline exists, mint the tokens!
    const issuerAccount = await server.loadAccount(issuerKeypair.publicKey());
    const tx = new TransactionBuilder(issuerAccount, {
      fee: "100",
      networkPassphrase: Networks.TESTNET,
    })
      .addOperation(
        Operation.payment({
          destination: targetPublicKey,
          asset: usdcAsset,
          amount: "1000",
        })
      )
      .setTimeout(30)
      .build();

    tx.sign(issuerKeypair);
    await server.submitTransaction(tx);
    console.log("✅ Successfully minted 1,000 USDC to your wallet!");
    console.log(`Don't forget to update NEXT_PUBLIC_USDC_ISSUER=${issuerKeypair.publicKey()} in your .env.local file!`);

  } catch (err) {
    console.error("Error during minting:", err.message);
  }
}

const target = process.argv[2];
if (!target) {
  console.log("Usage: node scripts/mint-usdc.js <your_freighter_public_key>");
  process.exit(1);
}

mintUSDC(target);
