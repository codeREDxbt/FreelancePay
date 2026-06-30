"use client";

/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState, useEffect, useCallback } from "react";
import { signInWithCustomToken, signOut } from "firebase/auth";
import { auth } from "@/lib/firebase/config";
import { toast } from "sonner";

interface WalletState {
  publicKey: string | null;
  isConnected: boolean;
  isLoading: boolean;
  error: string | null;
  walletNetwork: string | null;
}

interface StellarKit {
  setWallet: (id: string) => void;
  fetchAddress: () => Promise<{ address: string }>;
  refreshSupportedWallets: () => Promise<unknown[]>;
  signTransaction: (xdr: string, opts: { networkPassphrase: string }) => Promise<{ signedTxXdr: string }>;
}

interface StellarNetworks {
  PUBLIC: string;
  TESTNET: string;
}

const getKit = (): StellarKit | null =>
  typeof window !== "undefined" ? (window as unknown as Record<string, unknown>).__STELLAR_KIT__ as StellarKit | null : null;
const setKit = (k: StellarKit) => { if (typeof window !== "undefined") (window as unknown as Record<string, unknown>).__STELLAR_KIT__ = k; };

const getNetworks = (): StellarNetworks | null =>
  typeof window !== "undefined" ? (window as unknown as Record<string, unknown>).__STELLAR_NETWORKS__ as StellarNetworks | null : null;
const setNetworks = (n: StellarNetworks) => { if (typeof window !== "undefined") (window as unknown as Record<string, unknown>).__STELLAR_NETWORKS__ = n; };

function getWalletAddress() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("fp_wallet_address");
}

function setWalletAddress(address: string) {
  if (typeof window !== "undefined") {
    localStorage.setItem("fp_wallet_address", address);
  }
}

function clearWalletAddress() {
  if (typeof window !== "undefined") {
    localStorage.removeItem("fp_wallet_address");
  }
}

const DEFAULT_STATE: WalletState = {
  publicKey: null,
  isConnected: false,
  isLoading: true,
  error: null,
  walletNetwork: null,
};

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error(`Timed out after ${ms}ms`)), ms)
    ),
  ]);
}

import type { SupportedWallet } from "@/types";

export function useWallet() {
  const [state, setState] = useState<WalletState>(() => {
    if (typeof window === "undefined") return DEFAULT_STATE;
    const savedAddress = getWalletAddress();
    const kitExists = !!(window as unknown as Record<string, unknown>).__STELLAR_KIT__;
    return {
      publicKey: savedAddress,
      isConnected: !!savedAddress,
      isLoading: !kitExists,
      error: null,
      walletNetwork: null,
    };
  });

  const [supportedWallets, setSupportedWallets] = useState<SupportedWallet[]>([]);
  const [isModalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    let kit = getKit();
    const configuredSiteNetwork: string = process.env.NEXT_PUBLIC_STELLAR_NETWORK === "PUBLIC" ? "MAINNET" : "TESTNET";
    const detectWalletNetwork = async (kitInstance: StellarKit): Promise<string | null> => {
      try {
        const { getNetworkDetails } = await import("@stellar/freighter-api");
        const nd = await withTimeout(getNetworkDetails(), 3000);
        if (nd?.network) {
          return String(nd.network).toUpperCase();
        }
      } catch { /* not freighter or timed out */ }
      if (typeof window !== "undefined") {
        return null;
      }
      return null;
    };
    if (!kit && typeof window !== "undefined") {
      (async () => {
        try {
          const [
            { StellarWalletsKit },
            { Networks }
          ] = await Promise.all([
            import("@creit-tech/stellar-wallets-kit/sdk"),
            import("@creit-tech/stellar-wallets-kit/types")
          ]);
          
          const [
            { FreighterModule },
            { AlbedoModule },
            { WalletConnectModule }
          ] = await Promise.all([
            import("@creit-tech/stellar-wallets-kit/modules/freighter"),
            import("@creit-tech/stellar-wallets-kit/modules/albedo"),
            import("@creit-tech/stellar-wallets-kit/modules/wallet-connect")
          ]);
          
          setNetworks(Networks);
          
          const wcProjectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "89b09fbdf5d9095af2c2c9d7d4cde3b1";
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const modules: any[] = [
            new FreighterModule(),
            new AlbedoModule()
          ];
          
          if (wcProjectId) {
            modules.push(new WalletConnectModule({
              projectId: wcProjectId,
              metadata: {
                name: "FreelancePay",
                description: "Trustless Milestone Escrow on Stellar",
                url: typeof window !== "undefined" ? window.location.origin : "https://freelancepay.app",
                icons: [typeof window !== "undefined" ? `${window.location.origin}/logo.png` : "https://freelancepay.app/logo.png"]
              }
            }));
          }

          StellarWalletsKit.init({
            network: process.env.NEXT_PUBLIC_STELLAR_NETWORK === "PUBLIC" ? Networks.PUBLIC : Networks.TESTNET,
            selectedWalletId: "freighter",
            modules,
          });
          setKit(StellarWalletsKit);
          kit = StellarWalletsKit;
          
          const wallets = await kit.refreshSupportedWallets();
          setSupportedWallets(wallets as SupportedWallet[]);
          
          let wNetwork: string | null = null;
          if (typeof window !== "undefined" && getWalletAddress()) {
            wNetwork = await detectWalletNetwork(kit);
          }
          
          setState((s) => ({ ...s, isLoading: false, walletNetwork: wNetwork ?? (getWalletAddress() ? configuredSiteNetwork : s.walletNetwork) }));
        } catch (e: unknown) {
          const msg = e instanceof Error ? e.message : "Failed to load wallet module";
          setState((s) => ({ ...s, isLoading: false, error: msg }));
        }
      })();
    } else if (kit) {
      kit.refreshSupportedWallets().then(w => setSupportedWallets(w as SupportedWallet[])).catch(() => {});
      if (typeof window !== "undefined" && getWalletAddress()) {
        detectWalletNetwork(kit).then(n => {
          setState((s) => ({ ...s, walletNetwork: n ?? (getWalletAddress() ? configuredSiteNetwork : s.walletNetwork) }));
        }).catch(() => {
          setState((s) => ({ ...s, walletNetwork: getWalletAddress() ? configuredSiteNetwork : s.walletNetwork }));
        });
      }
    }
  }, []);

  const openModal = useCallback(() => setModalOpen(true), []);
  const closeModal = useCallback(() => setModalOpen(false), []);

  const connectWallet = useCallback(async (id: string) => {
    const kit = getKit();
    setState((s) => ({ ...s, isLoading: true, error: null }));
    try {
      if (!kit) {
        throw new Error("Wallet kit not initialized. Please refresh the page.");
      }

      kit.setWallet(id);
      const { address } = await kit.fetchAddress();

      const nonceRes = await fetch('/api/auth/nonce');
      const { nonce } = await nonceRes.json();

      await fetch('/api/auth/nonce', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ publicKey: address, nonce }),
      });

      let signature: string;
      if (id === 'freighter') {
        const { signMessage } = await import("@stellar/freighter-api");
        const res = await signMessage(nonce);
        if ('error' in res && res.error) throw new Error(String(res.error));
        if (!res.signedMessage) throw new Error("Signature was empty");
        signature = typeof res.signedMessage === 'string'
          ? res.signedMessage
          : Buffer.from(res.signedMessage).toString('base64');
      } else {
        throw new Error("Only Freighter is fully supported for Sign-In right now.");
      }

      const verifyRes = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ publicKey: address, signature, nonce }),
      });

      if (!verifyRes.ok) {
        const errData = await verifyRes.json().catch(() => ({}));
        const errorMsg = (errData as { error?: string }).error || "Failed to verify wallet signature";
        if (process.env.NODE_ENV !== 'production' && verifyRes.status === 500) {
          console.warn("Firebase Admin credentials missing or server error. Proceeding with local mock auth.", errorMsg);
        } else {
          throw new Error(errorMsg);
        }
      } else {
        const { customToken } = await verifyRes.json() as { customToken: string };
        await signInWithCustomToken(auth, customToken);
      }
      
      let wNetwork: string | null = null;
      const configuredSiteNetwork: string = process.env.NEXT_PUBLIC_STELLAR_NETWORK === "PUBLIC" ? "MAINNET" : "TESTNET";
      try {
        const { getNetworkDetails } = await import("@stellar/freighter-api");
        const nd = await withTimeout(getNetworkDetails(), 3000);
        wNetwork = nd?.network ? String(nd.network).toUpperCase() : null;
      } catch { /* non-freighter */ }
      if (!wNetwork) {
        try {
          const cachedNetworks = getNetworks();
          if (cachedNetworks) {
            const passphrase = process.env.NEXT_PUBLIC_STELLAR_NETWORK === "PUBLIC" ? cachedNetworks.PUBLIC : cachedNetworks.TESTNET;
            if (passphrase === cachedNetworks.PUBLIC) wNetwork = "MAINNET";
            else if (passphrase === cachedNetworks.TESTNET) wNetwork = "TESTNET";
          }
        } catch { /* ignore */ }
      }
      if (!wNetwork) wNetwork = configuredSiteNetwork;
      
      setWalletAddress(address);
      
      toast.success("Wallet connected successfully!");
      setState({
        publicKey: address,
        isConnected: true,
        isLoading: false,
        error: null,
        walletNetwork: wNetwork,
      });
      setModalOpen(false);
      return true;
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : "Failed to connect wallet";
      toast.error(`Connection Failed: ${errMsg}`);
      setState((s) => ({ ...s, isLoading: false, error: errMsg }));
      setModalOpen(false);
      return false;
    }
  }, []);

  const disconnectWallet = useCallback(async () => {
    if (typeof window !== "undefined") clearWalletAddress();
    try { await signOut(auth); } catch { /* already signed out */ }
    const kit = getKit();
    if (kit) { try { kit.setWallet(""); } catch { /* ignore */ } }
    setState(DEFAULT_STATE);
  }, []);

  const sign = useCallback(
    async (xdr: string) => {
      const kit = getKit();
      const cachedNetworks = getNetworks();
      if (!state.publicKey || !kit || !cachedNetworks) {
        toast.error("Wallet not connected");
        throw new Error("Wallet not connected");
      }
      try {
        const result = await kit.signTransaction(xdr, { 
          networkPassphrase: process.env.NEXT_PUBLIC_STELLAR_NETWORK === "PUBLIC" ? cachedNetworks.PUBLIC : cachedNetworks.TESTNET 
        });
        return result.signedTxXdr;
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "User rejected the request";
        toast.error(`Signature Failed: ${msg}`);
        throw err;
      }
    },
    [state.publicKey]
  );

  return { 
    ...state, 
    supportedWallets,
    isModalOpen,
    openModal,
    closeModal,
    connectWallet,
    disconnectWallet,
    sign 
  };
}