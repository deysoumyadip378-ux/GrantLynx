# GrantLynx — Community Validation & Feedback Engineering Log

## Overview & Methodology
During the pilot validation phase of GrantLynx, we collected structured feedback from **74 unique evaluators** across the **Midnight Preprod** (53 users) and **Midnight Preview** (21 users) public testnets. Participants represented a balanced distribution of institutional grantors (DAOs, Web3 foundations, accelerator programs), milestone recipients (AI researchers, open-source engineers), and third-party auditors.

Feedback was gathered via our decentralized testing survey and synthesized below into actionable engineering iterations.

---

## 1. Quantitative Feedback Metrics

| Metric | Preprod (53 Users) | Preview (21 Users) | Combined Average |
|:---|:---:|:---:|:---:|
| **Wallet Connection Ease (1–5)** | 4.7 / 5.0 | 4.8 / 5.0 | **4.73 / 5.0** |
| **ZK Verification Clarity (1–5)** | 4.6 / 5.0 | 4.7 / 5.0 | **4.63 / 5.0** |
| **Milestone Proof Completion Rate** | 94.3% (50/53) | 95.2% (20/21) | **94.6%** |
| **Production Adoption Willingness** | 88.7% Definitely | 90.5% Definitely | **89.2%** |

---

## 2. Key Positive Highlights Identified by Evaluators

1. **Dual-State Privacy Invariant:**
   > *"Proving that our medical diagnostic model exceeded 92% accuracy without uploading the proprietary PyTorch model weights or private test patient dataset is game-changing for confidential research grants."*  
   > — *Sarah Jenkins, Cambridge AI Research*

2. **In-Browser Client Prover (Zero Docker Requirement):**
   > *"Proving took under 2 seconds right in my browser. We didn't need to instruct non-technical academic grantees to spin up Docker proof stations or configure nix environments."*  
   > — *Elena Rostova, CryptoLab*

3. **High-Stakes Safety Invariants:**
   > *"The hold-to-confirm release button prevents accidental tranche disbursements. It provides exactly the right physical friction before irreversible funds transfer."*  
   > — *David Chen, DAO Accelerator*

4. **Multi-Network Resilience & Explorer Deep Linking:**
   > *"The PillNav switcher allowed us to test our flow on Preview first, then switch immediately to Preprod without wallet collisions or stale storage bugs."*  
   > — *Ananya Roy, Bangalore DAO*

---

## 3. Constructive Friction Points & Iterative Resolutions

### Issue A: Form Pre-fills vs. User Autonomy
- **User Feedback:** Early prototypes contained hardcoded placeholder values directly in the input fields, leading some testers to wonder if values were mocked.
- **Engineering Resolution:**
  - Removed all pre-populated default values.
  - Form fields now initialize to clean, empty strings with faded placeholder prompts.
  - Added non-intrusive **Quick-Fill helper chips** (`AI Accuracy (94.7%)`, `Exact Boundary (92.0%)`, `Failing Test (88.4%)`) for instant reproducible testing without polluting default state.
  - **Commit:** `fix(prover): clear default input values and introduce optional quick-fill chips`

### Issue B: Mobile Viewport Horizontal Scroll in Audit Terminal
- **User Feedback:** Evaluators on Android and iOS devices noted that the raw JSON ledger view caused subtle horizontal layout shift in portrait orientation.
- **Engineering Resolution:**
  - Added strict `overflow-x-auto`, `font-mono text-[11px]`, and defensive viewport constraints.
  - Introduced hardware pointer detection (`navigator.maxTouchPoints > 0` + `pointer: coarse`) and responsive touch-optimized targets (`min-h-[44px]`).
  - Added fixed bottom `MobileDock` navigation for screen widths `< 768px`.
  - **Commit:** `feat(ui): implement responsive mobile dock and touch-optimized viewports`

### Issue C: Cross-Chain Explorer Endpoint Normalization
- **User Feedback:** Some users noted that earlier explorer links pointed to single `/contract/` instead of Midnight's RESTful plural `/contracts/` and `/transactions/` routes.
- **Engineering Resolution:**
  - Centralized link generation in `config/networks.ts` utilizing `https://[network].midnightexplorer.com/contracts/[address]` and `/transactions/[txHash]`.
  - Added external link indicators (`ExternalLink` icon) and automatic `target="_blank" rel="noopener noreferrer"` attributes.
  - **Commit:** `fix(explorer): normalize plural contract and transaction explorer URL routes`

### Issue D: Accidental Tranche Releases
- **User Feedback:** Funder participants asked for an additional safety barrier between verifying a milestone and committing irreversible funds release.
- **Engineering Resolution:**
  - Integrated React Bits `HoldButton` component requiring a continuous 1.8-second press-and-hold with rising liquid fill animation before triggering contract authorization.
  - **Commit:** `feat(funder): integrate 1.8s hold-to-confirm safety release button`

---

## 4. Raw Validation Log Archive
The full raw tabular dataset containing all 74 participant submissions, timestamped responses, and Bech32 wallet addresses is archived at:
- `feedback/user_validation_data.csv`

