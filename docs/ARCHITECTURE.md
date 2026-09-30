# GrantLynx — Technical Architecture Specification

## System Overview
GrantLynx is an institutional-grade, privacy-preserving grant milestone verification and funding release platform built on the **Midnight Network**. It leverages Midnight's dual-state zero-knowledge architecture to enable grant recipients to cryptographically prove the satisfaction of complex project milestones without exposing proprietary source code, internal benchmark data, or confidential metrics to the public ledger or the funding organization.

---

## 1. High-Level Architectural Flow

```
┌────────────────────────────────────────────────────────────────────────┐
│                          Funder Workspace                              │
│   (Configures Policy Hash, Milestones, Thresholds & Tranche Amounts)  │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                        GrantLynx Policy Engine                         │
│     - Initializes Compact 0.5.2 Contract State                        │
│     - Binds Public Policy Commitment on Midnight Blockchain            │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                        Recipient Client Prover                         │
│     - Loads confidential evaluation metrics (e.g. Model Acc = 94.7%)   │
│     - Generates 256-bit blinding salt                                  │
│     - Computes in-browser ZK proof (Compact WASM Runtime)             │
│     - STRICT INVARIANT: Private data NEVER leaves local browser RAM    │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                       Compact Polynomial Circuit                       │
│     - Asserts: privateMetric >= activeThreshold                       │
│     - Computes persistentHash commitment over evidence & salt          │
│     - Discloses ONLY: milestoneStatus = VERIFIED, commitment, timestamp│
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                       Midnight Public Ledger                           │
│     - Updates on-chain milestone state: VERIFIED (2)                  │
│     - Sets isTrancheReleasable = TRUE                                  │
│     - Publishes transaction hash to midnightexplorer.com              │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                     Automated Tranche Settlement                       │
│     - Funder confirms release via 1.8s HoldButton authorization        │
│     - Contract transitions status to RELEASED (4)                      │
│     - Tranche funds unlocked to recipient vault                        │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Core Technological Layers

### Smart Contract Layer (Compact 0.5.2)
- **Language Version:** `pragma language_version >= 0.23.0;`
- **Compiler:** `compact 0.5.2` (via WSL Ubuntu / native Linux)
- **Key Circuits:**
  - `initializeGrant(policyHash, funderHash, milestoneCount)`: Single-invocation initialization guard.
  - `configureMilestone(milestoneId, threshold, trancheAmount)`: Funder policy parameter setup.
  - `verifyMilestoneZK(targetMilestoneId, currentTimestamp)`: The core zero-knowledge circuit asserting predicate satisfaction without disclosing witnesses.
  - `authorizeTrancheRelease(expectedFunderHash)`: Cryptographically checks funder secret commitment before releasing tranche.
  - `openDisputeWindow(disputeMilestoneId)`: Allows marking verified milestone as DISPUTED during review periods.

### Client-Side Prover & Frontend
- **Framework:** React 18.3, TypeScript 5.7, Vite 6.0.
- **Styling:** Tailwind CSS with custom midnight palette and glassmorphism.
- **Animations:** React Bits components (`SplitText`, `BlurText`, `GradientText`, `DecryptedText`, `CountUp`, `ShinyText`, `ClickSpark`, `SpringCheck`, `HoldButton`, `TiltedCard`, `PillNav`, `AnimatedList`).
- **Cryptographic Primitives:** Native `window.crypto.subtle` (SHA-256) for universal ESM compatibility and zero Node.js polyfill bloat.
- **Wallet Architecture:** Ephemeral in-memory sessions with v4 DApp Connector cascade and hardware pointer detection.

---

## 3. Directory Hierarchy
```
grantlynx/
├── contract/
│   ├── src/
│   │   └── grantlynx.compact         # Compact smart contract source
│   ├── managed/                      # ZK circuits, proving keys, and TypeScript bindings
│   ├── test/
│   │   └── grantlynx.test.ts         # Headless Vitest simulation test suite (11 tests)
│   ├── scripts/
│   │   ├── network.ts                # Dual-network resolution (Preview & Preprod)
│   │   ├── wallet.ts                 # Key derivation & WalletFacade
│   │   ├── wallet-state.ts           # Local wallet persistence (.midnight-state.json)
│   │   ├── check-balance.ts          # Chain sync & balance checker
│   │   └── deploy.ts                 # Automated Substrate/Polkadot deployment
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── public/assets/                # Generated brand assets & wallpapers
│   ├── src/
│   │   ├── components/
│   │   │   ├── animations/           # React Bits animation components
│   │   │   ├── dashboard/            # Overview, stats, active grants
│   │   │   ├── funder/               # Grant creation and milestone policy builder
│   │   │   ├── landing/              # Hero section & pipeline infographic
│   │   │   ├── layout/               # Navbar, MobileDock, Footer
│   │   │   └── verification/         # Prover (Top), Pipeline (Middle), Verifier (Bottom)
│   │   ├── config/networks.ts        # Preview & Preprod endpoints
│   │   ├── hooks/useMidnightWallet.ts# Resilient multi-wallet hook
│   │   ├── services/                 # Indexer & cryptographic contract services
│   │   ├── styles/index.css          # Silk backdrop & Tailwind styles
│   │   ├── utils/deviceDetect.ts     # Hardware detection & mobile deep links
│   │   ├── App.tsx                   # Main orchestration
│   │   └── main.tsx
│   ├── package.json
│   └── vite.config.ts
├── docs/
│   ├── ARCHITECTURE.md
│   ├── PRIVACY_MODEL.md
│   └── FEEDBACK.md
├── feedback/
│   └── user_validation_data.csv      # 74 validated user test records
├── .github/workflows/ci.yml          # Automated CI/CD pipeline
├── docker-compose.yml                # Midnight proof server configuration
├── README.md
└── TASK_LOGS.md
```

