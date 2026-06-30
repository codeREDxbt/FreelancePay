#!/usr/bin/env bash
# Deploy the LiquidityPool AMM contract to Stellar testnet and seed it with initial liquidity.
#
# Prerequisites:
#   - stellar CLI installed (the modern replacement for soroban-cli;
#     bundled binary at $env:USERPROFILE\bin\soroban.exe on Windows)
#   - A funded testnet admin account (use friendbot if needed)
#   - Set ADMIN_SECRET below to your disposable admin secret key
#
# Steps:
#   1. Build the WASM:  cd contracts/liquidity_pool && cargo build --target wasm32-unknown-unknown --release
#   2. Run this script:  bash scripts/deploy-amm.sh
#   3. Copy the AMM_CONTRACT_ID printed at the end into your .env.local as NEXT_PUBLIC_AMM_CONTRACT_ID

set -euo pipefail

# `stellar` is the modern CLI; the binary is also symlinked/aliased as `soroban`.
CLI="${CLI:-stellar}"

ADMIN_SECRET="${ADMIN_SECRET:-ADMIN_SECRET_HERE}"

if [ "$ADMIN_SECRET" = "ADMIN_SECRET_HERE" ]; then
  echo "ERROR: Set ADMIN_SECRET environment variable to your funded testnet admin secret key."
  echo "  ADMIN_SECRET=\"S.....\" bash scripts/deploy-amm.sh"
  exit 1
fi

NETWORK="testnet"
WASM_PATH="../contracts/liquidity_pool/target/wasm32-unknown-unknown/release/liquidity_pool.wasm"

if [ ! -f "$WASM_PATH" ]; then
  echo "ERROR: WASM not found at $WASM_PATH"
  echo "Build it first:"
  echo "  cd contracts/liquidity_pool"
  echo "  cargo build --target wasm32-unknown-unknown --release"
  exit 1
fi

# Ensure the admin identity is registered with the CLI (hidden keyring on Windows).
ADMIN_PUBLIC="$($CLI keys address --name admin 2>/dev/null || true)"
if [ -z "$ADMIN_PUBLIC" ]; then
  echo "=== Registering admin identity with $CLI ==="
  $CLI keys add admin --secret-key "$ADMIN_SECRET" >/dev/null
  ADMIN_PUBLIC="$($CLI keys address --name admin)"
fi
echo "Admin public key: $ADMIN_PUBLIC"

echo ""
echo "=== Step 1: Deploy the liquidity_pool WASM ==="
$CLI contract deploy \
  --name liquidity_pool \
  --source-account admin \
  --network $NETWORK \
  --wasm $WASM_PATH

WASM_HASH="$($CLI contract install \
  --source-account admin \
  --network $NETWORK \
  --wasm $WASM_PATH \
  --ignore-unsigned 2>/dev/null || echo '')"

echo ""
echo "=== Step 2: Create the contract instance ==="
AMM_ID="$($CLI contract deploy \
  --name liquidity_pool \
  --source-account admin \
  --network $NETWORK \
  --wasm-hash "$(echo "$WASM_HASH" | tr -d '\r\n')" 2>/dev/null \
  || $CLI contract deploy \
       --name liquidity_pool \
       --source-account admin \
       --network $NETWORK \
       --wasm $WASM_PATH)"

echo "AMM Contract ID: $AMM_ID"

echo ""
echo "=== Step 3: Get SAC addresses ==="
# XLM native SAC address is the same on testnet and pubnet:
XLM_SAC="CDLZFC3SYJYDZT7H67QDL7XKR5ALUT2NOVZXW2A7CBQ2RORQGAZHQ5C2"

# Derive USDC SAC address from issuer
USDC_SAC=$($CLI contract id asset --asset "USDC:GAHPYWLK6YRN7CVYZOO4H3VDRZ7PVF5UJGLZCSPAEIKJE2XSWF5LAGER" --network $NETWORK 2>/dev/null || echo "CAZRY5GSFBFXD7H6GAFBA5YGYQTDXU4QKWKMYFWBAZFUCURN3WKX6LF5")
echo "XLM SAC: $XLM_SAC"
echo "USDC SAC: $USDC_SAC"

echo ""
echo "=== Step 4: Initialize the AMM contract ==="
$CLI contract invoke \
  --source-account admin \
  --network $NETWORK \
  --id "$AMM_ID" \
  -- \
  initialize \
  --admin "$ADMIN_PUBLIC" \
  --token_a "$XLM_SAC" \
  --token_b "$USDC_SAC"

echo ""
echo "=== Step 5: Seed initial liquidity ==="
echo "  (Deposits 500 XLM and 85 USDC into the pool, implying ~$0.17/XLM rate)"
$CLI contract invoke \
  --source-account admin \
  --network $NETWORK \
  --id "$AMM_ID" \
  -- \
  add_liquidity \
  --user "$ADMIN_PUBLIC" \
  --amount_a 5000000000 \
  --amount_b 850000000 \
  --min_lp_shares 0

echo ""
echo "=== DONE ==="
echo "Add this to your .env.local:"
echo "  NEXT_PUBLIC_AMM_CONTRACT_ID=$AMM_ID"
