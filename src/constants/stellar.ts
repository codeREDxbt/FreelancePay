import { Networks } from "@stellar/stellar-sdk";

export const STELLAR_CONFIG = {
  network: Networks.TESTNET,
  horizonUrl: process.env.NEXT_PUBLIC_HORIZON_URL!,
  sorobanRpcUrl: process.env.NEXT_PUBLIC_SOROBAN_RPC_URL!,
  contractId: process.env.NEXT_PUBLIC_ESCROW_CONTRACT_ID!,
  usdc: {
    code: "USDC",
    issuer: process.env.NEXT_PUBLIC_USDC_ISSUER!,
  },
  anchorUrl: process.env.NEXT_PUBLIC_ANCHOR_URL!,
};
