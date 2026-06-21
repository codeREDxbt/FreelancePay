"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import { Client, EscrowState, networks } from "escrow";
import { useWallet } from "./useWallet";
import { submitSignedTransaction } from "@/lib/stellar/utils";
import { STELLAR_CONFIG } from "@/constants/stellar";
import { toast } from "sonner";

export function useEscrow(contractId?: string) {
  const { isConnected, publicKey, sign } = useWallet();
  const [state, setState] = useState<EscrowState | null>(null);
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const resolvedContractId = contractId || STELLAR_CONFIG.contractId;

  const client = useMemo(() => {
    return new Client({
      ...networks.testnet,
      contractId: resolvedContractId,
      rpcUrl: process.env.NEXT_PUBLIC_SOROBAN_RPC_URL || "https://soroban-testnet.stellar.org:443",
      publicKey: publicKey || undefined,
    });
  }, [publicKey, resolvedContractId]);

  const fetchState = useCallback(async () => {
    setIsFetching(true);
    setError(null);
    try {
      const tx = await client.get_state();
      if (tx.result) {
        setState(tx.result);
      }
    } catch (err: unknown) {
      const msg: string = err instanceof Error ? err.message : String(err);

      const isUninitialized =
        msg.includes("InvalidAction") ||
        msg.includes("WasmVm") ||
        msg.includes("UnreachableCodeReached") ||
        msg.includes("get_state");

      if (isUninitialized) {
        setState(null);
      } else {
        setError("Network error — could not reach the Stellar RPC");
      }
    } finally {
      setIsFetching(false);
    }
  }, [client]);

  useEffect(() => {
    if (isConnected) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      fetchState();
    }
  }, [isConnected, fetchState]);

  const approveMilestone = useCallback(async (milestoneId: number) => {
    if (!isConnected) {
      toast.error("Wallet not connected");
      throw new Error("Wallet not connected");
    }
    setIsFetching(true);
    setError(null);
    const toastId = toast.loading("Waiting for wallet signature...");
    
    try {
      const tx = await client.approve_milestone({ milestone_id: milestoneId });
      
      const signedXdr = await sign(tx.built!.toXDR());
      toast.loading("Submitting transaction to Soroban...", { id: toastId });
      
      const result = await submitSignedTransaction(signedXdr);
      
      toast.success("Milestone approved and funds released!", { id: toastId });
      await fetchState();
      return result;
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : "Failed to approve milestone";
      setError(errMsg);
      toast.error(`Transaction Failed: ${errMsg}`, { id: toastId });
      throw err;
    } finally {
      setIsFetching(false);
    }
  }, [isConnected, client, sign, fetchState]);

  const initializeEscrow = useCallback(async (
    freelancerAddress: string,
    amounts: number[],
    descriptions: string[]
  ) => {
    if (!isConnected) {
      toast.error("Wallet not connected");
      throw new Error("Wallet not connected");
    }
    setIsFetching(true);
    setError(null);
    const toastId = toast.loading("Waiting for wallet signature...");
    
    try {
      const amountsI128 = amounts.map(a => BigInt(Math.round(a * 10_000_000)));
      
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const tx = await (client as any).initialize({
        client: publicKey!,
        freelancer: freelancerAddress,
        admin: publicKey!,
        token: STELLAR_CONFIG.contractId,
        milestone_amounts: amountsI128,
        milestone_descriptions: descriptions,
      });
      
      const signedXdr = await sign(tx.built!.toXDR());
      toast.loading("Submitting funding transaction to Soroban...", { id: toastId });
      
      const result = await submitSignedTransaction(signedXdr);

      toast.success("Contract funded successfully!", { id: toastId });

      await new Promise(r => setTimeout(r, 1500));
      await fetchState();
      
      return result;
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : "Failed to initialize escrow";
      setError(errMsg);
      toast.error(`Transaction Failed: ${errMsg}`, { id: toastId });
      throw err;
    } finally {
      setIsFetching(false);
    }
  }, [isConnected, client, publicKey, sign, fetchState]);

  return {
    state,
    isLoading: isFetching,
    error,
    refresh: fetchState,
    approveMilestone,
    initializeEscrow,
  };
}