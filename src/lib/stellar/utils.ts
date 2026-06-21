import { sorobanServer } from "./client";

const MAX_POLL_ATTEMPTS = 60;
const POLL_INTERVAL_MS = 1000;

export async function submitSignedTransaction(signedXdr: string) {
  // The on-the-wire `sendTransaction` accepts the XDR envelope directly,
  // but the TS type still narrows to `Transaction | FeeBumpTransaction`.
  // Pass the raw XDR — the Soroban host accepts it as-is.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const result = await (sorobanServer as any).sendTransaction(signedXdr);
  if (result.status === "ERROR") {
    throw new Error(`Transaction failed: ${JSON.stringify(result.errorResult)}`);
  }

  const poll = async (attempt: number): Promise<any> => {
    if (attempt >= MAX_POLL_ATTEMPTS) {
      throw new Error(`Transaction polling timed out after ${MAX_POLL_ATTEMPTS * POLL_INTERVAL_MS / 1000}s`);
    }
    const getResult = await sorobanServer.getTransaction(result.hash);

    if (getResult.status === "NOT_FOUND") {
      await new Promise((r) => setTimeout(r, POLL_INTERVAL_MS));
      return poll(attempt + 1);
    }

    if (getResult.status === "FAILED") {
      throw new Error("Transaction execution failed");
    }

    return getResult;
  };

  return poll(0);
}

const usdcFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

function formatUSDC(amount: number): string {
  return usdcFormatter.format(amount);
}

function shortenAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}