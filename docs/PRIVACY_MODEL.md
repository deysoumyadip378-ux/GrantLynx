# GrantLynx — Dual-State Privacy Model & Cryptographic Invariants

## Core Privacy Philosophy
GrantLynx is designed from first principles around the **strict separation of private witness data and public ledger state**. In traditional grant tracking systems, recipients must either surrender trade secrets (source code, proprietary weights, unreleased datasets) or rely on subjective manual reviews.

Midnight’s **Compact** domain-specific language allows GrantLynx to define explicit boundaries between off-chain witness inputs and disclosed on-chain ledger variables.

---

## 1. Frozen Privacy vs. Public State Matrix

| Data Element | State Classification | Execution Boundary | Observer Visibility | Rationale |
|:---|:---:|:---:|:---:|:---|
| **Grant Policy Commitment** | **PUBLIC** | On-Chain Ledger (`Bytes<32>`) | Visible to all | Both grantor and grantee must mutually agree on the immutable policy hash. |
| **Funder Identity Commitment** | **PUBLIC** | On-Chain Ledger (`Bytes<32>`) | Visible to all | Identifies the grantor entity responsible for funding releases. |
| **Milestone Numerical Threshold** | **PUBLIC** | On-Chain Ledger (`Uint<64>`) | Visible to all | The requirement itself (e.g. `≥ 92% accuracy` or `≥ 10,000 txs`) is public. |
| **Milestone Verification Status** | **PUBLIC** | On-Chain Ledger (`Uint<64>`) | Visible to all | Status transitions (PENDING, VERIFIED, DISPUTED, RELEASED) must be universally auditable. |
| **Proof Commitment Hash** | **PUBLIC** | On-Chain Ledger (`Bytes<32>`) | Visible to all | Cryptographic fingerprint binding the proof to the milestone without exposing evidence. |
| **Tranche Release Eligibility** | **PUBLIC** | On-Chain Ledger (`Boolean`) | Visible to all | Flag indicating whether funds are currently releasable. |
| **Verification Block Timestamp** | **PUBLIC** | On-Chain Ledger (`Uint<64>`) | Visible to all | Provides tamper-proof timestamp of when verification was settled. |
| **Confidential Measured Metric** | **PRIVATE WITNESS** | In-Memory Prover (`Uint<64>`) | **NEVER DISCLOSED** | The recipient's actual performance score (e.g. 94.73%) is processed only inside the ZK circuit. |
| **Evidence Dataset / Preimage** | **PRIVATE WITNESS** | In-Memory Prover (`Bytes<32>`) | **NEVER DISCLOSED** | The raw dataset, evaluation log, or binary artifact stays local to the recipient machine. |
| **Blinding Salt** | **PRIVATE WITNESS** | In-Memory Prover (`Bytes<32>`) | **NEVER DISCLOSED** | 256-bit cryptographically secure salt prevents dictionary attacks and rainbow table matching. |
| **Funder Secret Key Witness** | **PRIVATE WITNESS** | In-Memory Prover (`Bytes<32>`) | **NEVER DISCLOSED** | Used to authorize releases without publishing administrative private keys. |

---

## 2. What an External Observer or Auditor Learns

When inspecting a transaction on Midnight Explorer:
- **They Learn:**
  - That a specific grant with policy hash `H(policy)` was initialized.
  - That milestone #3 required satisfying an agreed threshold (e.g., `≥ 92`).
  - That a valid zero-knowledge SNARK proof was verified by the network validators at block `#1420950`.
  - That the recipient's confidential metric mathematically met or exceeded the threshold.
  - That the resulting 32-byte commitment `persistentHash(salt, evidence)` was recorded.
  - That tranche #3 is now eligible for release.

- **They CANNOT Learn:**
  - The actual measured metric (e.g., whether the recipient achieved 92.1% or 99.8%).
  - The recipient's proprietary training algorithm, hyperparameters, or model weights.
  - The underlying benchmark dataset, patient records, or internal evaluation data.
  - The recipient's private salt or secret keys.

---

## 3. Cryptographic Invariants Enforced in Circuit

```compact
// THE ZERO-KNOWLEDGE PREDICATE CHECK:
// Asserts privateMetric >= activeThreshold WITHOUT disclosing privateMetric
assert(privateMetric >= activeThreshold, "Private milestone metric does not satisfy agreed threshold");

// Blinded commitment binds evidence without revealing it
const commitment = persistentHash<Bytes<32>>(privateSalt);

// Disclose only the result and commitment to the public ledger
activeProofCommitment = disclose(commitment);
activeMilestoneStatus = 2; // VERIFIED
isTrancheReleasable = true;
```

These invariants are mathematically enforced at compile-time by the Compact compiler (`compact 0.5.2`) and verified on-chain by the Midnight Substrate consensus nodes.

