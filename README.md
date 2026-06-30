# FreelancePay

> Trustless Milestone Escrow & Cross-Border Payouts on Stellar

**Author:** codeREDxbt  
**GitHub:** [codeREDxbt](https://github.com/codeREDxbt)

## Live Demo & Links
- **Live Demo:** [freelancepay-live.vercel.app](https://freelancepay-live.vercel.app)
- **Demo Video:** [Watch on Google Drive](https://drive.google.com/file/d/1hqha3FRoAfrMUZ23pEreXLHKh4nNEfsM/view?usp=sharing)
- **Contract Address (Soroban Testnet):** `CAC3XR6VYSDMTUNQXIJGOVJEEOO6H5PTFCS5VHPY5X64JAXKIJNBOGLU`
- **Proof of 10+ Wallet Interactions:** [View on Stellar Expert](https://stellar.expert/explorer/testnet/contract/CAC3XR6VYSDMTUNQXIJGOVJEEOO6H5PTFCS5VHPY5X64JAXKIJNBOGLU)

## About the Project

FreelancePay is a decentralized platform built to secure work and payments using programmable trust on the Stellar network. It provides milestone-based escrow tailored for the global workforce, ensuring that freelancers get paid for their completed work and clients only release funds when milestones are met.

This repository contains **over 15+ meaningful commits**, showcasing continuous development, smart contract integration, UI improvements, and core feature implementations.

## Screenshots

### Product UI & Landing
![Landing Page](./public/Landing.png)

### Dashboard
![Dashboard](./public/Dashboard.png)

### Contracts & Milestones
![Contracts](./public/Contracts.png)

### Payments
![Payments](./public/Payments.png)

### Mobile Responsive Design
![Mobile Landing](./public/Mobile%20landing.png)

*Note: Analytics are integrated via PostHog to track user behavior and engagement.*

## User Feedback Summary

During the initial testing phase, we collected feedback from early users testing the platform on the Soroban Testnet:
- **Clean and Intuitive UI:** Users consistently praised the dashboard layout and the ease of navigating between contracts, milestones, and payments.
- **Trust and Security:** Freelancers loved the milestone-based escrow concept, noting that it brings peace of mind knowing funds are locked in a smart contract.
- **Wallet Integration:** The seamless integration with Freighter was highlighted as a smooth experience, though some users requested support for additional wallets in the future.
- **Mobile Experience:** The responsive design was well-received, allowing users to check their payment statuses easily on their phones.

## Tech Stack
- **Frontend:** Next.js 16, React 19, TypeScript, Tailwind CSS
- **Blockchain:** Stellar Soroban (Rust smart contracts)
- **Wallet:** Freighter (Stellar Wallets Kit)
- **Database:** Firebase Firestore (with security rules)
- **Monitoring & Analytics:** Sentry, PostHog, Vercel Analytics
- **Deployment:** Vercel

## Complete Documentation & Setup

### Prerequisites
- Node.js & pnpm
- Rust toolchain (for Soroban contracts)
- Stellar CLI

### Installation
```bash
git clone https://github.com/codeREDxbt/FreelancePay
cd FreelancePay
pnpm install
cp .env.example .env.local
```

Fill in the `.env.local` values (Firebase config, Soroban RPC, PostHog keys, etc.).

### Running Locally
```bash
pnpm dev
```
Navigate to `http://localhost:3000` to view the app.

### Smart Contract Deployment
The smart contract is located in `contracts/escrow/`.

To build the contract:
```bash
cd contracts/escrow
cargo check --target wasm32-unknown-unknown
cargo test
```

To deploy the contract to Testnet:
```bash
stellar contract deploy \
  --source admin \
  --network testnet \
  --wasm target/wasm32-unknown-unknown/release/escrow.wasm
```

### Monitoring & Analytics
- **Vercel Speed Insights** are enabled for performance tracking.
- **PostHog** is set up for event tracking and user behavior analytics. (Note: Disable adblockers locally to test analytics ingestion).
- **Sentry** is configured for error tracking and performance monitoring.

---
*Built for the Stellar ecosystem.*
