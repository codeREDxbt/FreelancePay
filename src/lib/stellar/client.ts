import { Horizon, rpc } from "@stellar/stellar-sdk";
import { STELLAR_CONFIG } from "@/constants/stellar";
import type { AccountBalanceResult } from "@/types";

export const horizonServer = new Horizon.Server(STELLAR_CONFIG.horizonUrl, {
  allowHttp: false,
});

export const sorobanServer = new rpc.Server(
  STELLAR_CONFIG.sorobanRpcUrl,
  { allowHttp: false }
);

export async function getAccountBalance(
  publicKey: string,
  assetCode: string = "XLM"
): Promise<AccountBalanceResult> {
  try {
    const account = await horizonServer.loadAccount(publicKey);
    
    if (assetCode === "XLM") {
      const xlmBalance = account.balances.find(
        (b) => b.asset_type === "native"
      );
      return { balance: xlmBalance?.balance ?? "0", error: null };
    }
    
    const tokenBalance = account.balances.find(
      (b) => {
        if (b.asset_type === "native" || !("asset_code" in b)) return false;
        const bTyped = b as { asset_code: string; asset_issuer?: string };
        if (bTyped.asset_code !== assetCode) return false;
        if (assetCode === STELLAR_CONFIG.usdc.code) {
          return "asset_issuer" in b && bTyped.asset_issuer === STELLAR_CONFIG.usdc.issuer;
        }
        return true;
      }
    );
    
    const bal = (tokenBalance as { balance?: string } | undefined)?.balance ?? "0";
    return { balance: bal, error: null };
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Failed to load account balance";
    return { balance: "0", error: msg };
  }
}