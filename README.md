# FreelancePay
> Trustless Milestone Escrow & Cross-Border Payouts on Stellar

## Live Demo
[freelancepay-live.vercel.app](https://freelancepay-live.vercel.app) *(Replace with your live URL after deploying)*

## Contract Address
`CBKL4DUPQ4WEBEE6YM5LINHMS323NDUAIDLVBACYVID3I4P4ONE7BHMQ` (Soroban Testnet) — [View on Stellar Expert](https://stellar.expert/explorer/testnet/contract/CBKL4DUPQ4WEBEE6YM5LINHMS323NDUAIDLVBACYVID3I4P4ONE7BHMQ)

## Tech Stack
- **Frontend:** Next.js 16, React 19, TypeScript, Tailwind CSS
- **Blockchain:** Stellar Soroban (Rust smart contracts)
- **Wallet:** Freighter (Stellar Wallets Kit)
- **Ramps:** Stellar Anchors via SEP-24 (coming soon via Modal)
- **Database:** Firebase Firestore (with security rules)
- **Auth:** Sign-In With Stellar (SIWS) + Firebase custom tokens
- **Monitoring:** Sentry, PostHog, Vercel Analytics
- **Deployment:** Vercel

## Setup
```bash
git clone https://github.com/yourusername/freelancepay
cd freelancepay
pnpm install
cp .env.example .env.local
# Fill in .env.local values (see .env.example for required keys)
pnpm dev
```

## Smart Contract
Located in `contracts/escrow/`. Build with:
```bash
cd contracts/escrow
cargo check --target wasm32-unknown-unknown
cargo test
```

Deploy:
```bash
soroban contract deploy --source admin --network testnet --wasm target/wasm32-unknown-unknown/release/escrow.wasm
```

## Screenshots

*(Add your screenshots here for the submission!)*

### Dashboard UI
![Dashboard](./docs/screenshots/dashboard.png)

### Contract Creation
![New Contract](./docs/screenshots/new-contract.png)

### PostHog Analytics
![PostHog](./docs/screenshots/posthog.png)

---
*Built for Stellar Builder Program — Level 4*
