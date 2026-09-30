import type { NetworkId } from '../config/networks.js';
import { NETWORK_CONFIGS } from '../config/networks.js';

export interface GrantPolicy {
  id: string;
  title: string;
  funderName: string;
  totalGrantAmount: number;
  totalMilestones: number;
  policyHash: string;
  funderAddress: string;
  networkId: NetworkId;
  createdAt: string;
}

export interface MilestoneRecord {
  id: number;
  title: string;
  description: string;
  predicateType: 'ACCURACY_THRESHOLD' | 'TX_COUNT' | 'PERFORMANCE_LATENCY' | 'DELIVERY_PERCENT';
  thresholdValue: number;
  unit: string;
  trancheAmount: number;
  status: 0 | 1 | 2 | 3 | 4; // 0=Unset, 1=Pending, 2=Verified, 3=Disputed, 4=Released
  proofCommitment?: string;
  verifiedAt?: string;
  txHash?: string;
}

/**
 * Browser-native SHA-256 cryptographic hashing via window.crypto.subtle
 * Prevents Node.js Buffer / crypto breakages in Vite/ESM browser bundles.
 */
export async function sha256Hex(message: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(message);
  const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Generates cryptographically secure 32-byte salt in hex format
 */
export function generateRandomSalt(): string {
  const bytes = new Uint8Array(32);
  window.crypto.getRandomValues(bytes);
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export interface ZkProofVerificationInput {
  milestoneId: number;
  thresholdValue: number;
  privateMetricValue: number;
  evidenceIdentifier: string;
  privateSalt?: string;
}

export interface ZkProofResult {
  isVerified: boolean;
  milestoneId: number;
  proofCommitment: string;
  settledTxHash: string;
  timestamp: string;
  blockHeight: number;
  disclosedStatus: 'VERIFIED' | 'FAILED';
  verificationLatencyMs: number;
}

export async function executeMilestoneProofZK(
  input: ZkProofVerificationInput,
  networkId: NetworkId
): Promise<ZkProofResult> {
  const startTime = Date.now();

  // 1. Client-Side Mathematical Predicate Check
  if (input.privateMetricValue < input.thresholdValue) {
    throw new Error(
      `Zero-Knowledge Predicate Failure: Confidential metric (${input.privateMetricValue}) does not satisfy agreed threshold (>= ${input.thresholdValue})`
    );
  }

  // 2. Derive blinded cryptographic commitment over private evidence & salt
  const salt = input.privateSalt || generateRandomSalt();
  const rawPreimage = `grantlynx:milestone:${input.milestoneId}:${salt}:${input.evidenceIdentifier}`;
  const commitment = await sha256Hex(rawPreimage);

  // 3. Simulate local client-side proof generation latency (WASM/Prover)
  await new Promise((resolve) => setTimeout(resolve, 1400));

  // 4. Generate deterministic transaction hash representing on-chain settlement
  const txPreimage = `${commitment}:${Date.now()}:${networkId}`;
  const txHash = (await sha256Hex(txPreimage)).slice(0, 64);

  const baseBlock = networkId === 'preview' ? 1420950 : 2589800;
  const blockHeight = baseBlock + Math.floor(Math.random() * 20);

  return {
    isVerified: true,
    milestoneId: input.milestoneId,
    proofCommitment: commitment,
    settledTxHash: txHash,
    timestamp: new Date().toISOString(),
    blockHeight,
    disclosedStatus: 'VERIFIED',
    verificationLatencyMs: Date.now() - startTime,
  };
}

