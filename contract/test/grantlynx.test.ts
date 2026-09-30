import { describe, it, expect } from 'vitest';
import { Contract, ledger } from '../managed/contract/index.js';
import { createCircuitContext, dummyContractAddress } from '@midnight-ntwrk/compact-runtime';

describe('GrantLynx Confidential Milestone Verification & Funding Release Circuits', () => {
  const coinPublicKey = { bytes: new Uint8Array(32) };

  function getInitialCircuitContext(contract: Contract<any>) {
    const initResult = contract.initialState({
      initialPrivateState: {},
      initialZswapLocalState: {
        coinPublicKey,
        currentIndex: 0n,
        inputs: [],
        outputs: []
      }
    });
    return createCircuitContext(
      dummyContractAddress(),
      coinPublicKey,
      initResult.currentContractState.data,
      initResult.currentPrivateState
    );
  }

  // Common dummy witnesses
  const createMockContract = (overrides?: Partial<{
    metric: bigint;
    salt: Uint8Array;
    evidence: Uint8Array;
    funderSecret: Uint8Array;
  }>) => {
    const metric = overrides?.metric ?? 95n;
    const salt = overrides?.salt ?? new Uint8Array(32).fill(7);
    const evidence = overrides?.evidence ?? new Uint8Array(32).fill(11);
    const funderSecret = overrides?.funderSecret ?? new Uint8Array(32).fill(42);

    return new Contract({
      getPrivateMetric: (ctx) => [ctx.privateState, metric],
      getPrivateSalt: (ctx) => [ctx.privateState, salt],
      getMilestoneEvidenceHash: (ctx) => [ctx.privateState, evidence],
      getFunderAuthSecret: (ctx) => [ctx.privateState, funderSecret],
    });
  };

  describe('Circuit 1: initializeGrant & Initialization Guards', () => {
    it('1. successfully initializes grant with policy commitment and funder identity', () => {
      const contract = createMockContract();
      const initialCtx = getInitialCircuitContext(contract);
      const policyHash = new Uint8Array(32).fill(1);
      const funderHash = new Uint8Array(32).fill(2);
      const totalMilestones = 4n;

      const result = contract.impureCircuits.initializeGrant(initialCtx, policyHash, funderHash, totalMilestones);
      expect(result.result).toBe(true);

      const state = ledger(result.context.currentQueryContext.state);
      expect(state.isInitialized).toBe(true);
      expect(state.totalMilestones).toBe(4n);
      expect(state.grantPolicyCommitment).toEqual(policyHash);
      expect(state.funderCommitment).toEqual(funderHash);
    });

    it('2. prevents re-initialization exploits with strict assertion check', () => {
      const contract = createMockContract();
      const initialCtx = getInitialCircuitContext(contract);
      const policyHash = new Uint8Array(32).fill(1);
      const funderHash = new Uint8Array(32).fill(2);

      const initialized = contract.impureCircuits.initializeGrant(initialCtx, policyHash, funderHash, 4n);

      expect(() => {
        contract.impureCircuits.initializeGrant(initialized.context, policyHash, funderHash, 4n);
      }).toThrow('Grant already initialized');
    });
  });

  describe('Circuit 2: configureMilestone', () => {
    it('3. configures active milestone condition and tranche funding', () => {
      const contract = createMockContract();
      const initialCtx = getInitialCircuitContext(contract);
      const policyHash = new Uint8Array(32).fill(1);
      const funderHash = new Uint8Array(32).fill(2);

      const initialized = contract.impureCircuits.initializeGrant(initialCtx, policyHash, funderHash, 5n);
      const configRes = contract.impureCircuits.configureMilestone(initialized.context, 1n, 90n, 500000n);
      expect(configRes.result).toBe(true);

      const state = ledger(configRes.context.currentQueryContext.state);
      expect(state.activeMilestoneId).toBe(1n);
      expect(state.activeThreshold).toBe(90n);
      expect(state.activeTrancheAmount).toBe(500000n);
      expect(state.activeMilestoneStatus).toBe(1n); // PENDING
      expect(state.isTrancheReleasable).toBe(false);
    });

    it('4. rejects configuring milestone ID exceeding declared total', () => {
      const contract = createMockContract();
      const initialCtx = getInitialCircuitContext(contract);
      const policyHash = new Uint8Array(32).fill(1);
      const funderHash = new Uint8Array(32).fill(2);

      const initialized = contract.impureCircuits.initializeGrant(initialCtx, policyHash, funderHash, 3n);

      expect(() => {
        contract.impureCircuits.configureMilestone(initialized.context, 4n, 90n, 100000n);
      }).toThrow('Milestone ID exceeds total milestones');
    });
  });

  describe('Circuit 3: verifyMilestoneZK (Confidential Zero-Knowledge Verification)', () => {
    it('5. proves private metric satisfies threshold and unlocks tranche release', () => {
      const privateMetric = 94n;
      const threshold = 92n;
      const timestamp = 1788800100n;

      const contract = createMockContract({ metric: privateMetric });
      const initialCtx = getInitialCircuitContext(contract);
      const policyHash = new Uint8Array(32).fill(1);
      const funderHash = new Uint8Array(32).fill(2);

      const initCtx = contract.impureCircuits.initializeGrant(initialCtx, policyHash, funderHash, 3n).context;
      const configCtx = contract.impureCircuits.configureMilestone(initCtx, 1n, threshold, 250000n).context;

      const verifyResult = contract.impureCircuits.verifyMilestoneZK(configCtx, 1n, timestamp);
      expect(verifyResult.result).toBe(true);

      const state = ledger(verifyResult.context.currentQueryContext.state);
      expect(state.activeMilestoneStatus).toBe(2n); // VERIFIED
      expect(state.isTrancheReleasable).toBe(true);
      expect(state.lastVerifiedTimestamp).toBe(timestamp);
      expect(state.activeProofCommitment.length).toBe(32);
    });

    it('6. succeeds at exact threshold boundary condition (boundary test)', () => {
      const boundaryMetric = 92n;
      const threshold = 92n;

      const contract = createMockContract({ metric: boundaryMetric });
      const initialCtx = getInitialCircuitContext(contract);

      const initCtx = contract.impureCircuits.initializeGrant(initialCtx, new Uint8Array(32), new Uint8Array(32), 3n).context;
      const configCtx = contract.impureCircuits.configureMilestone(initCtx, 1n, threshold, 250000n).context;

      const verifyResult = contract.impureCircuits.verifyMilestoneZK(configCtx, 1n, 1788800200n);
      expect(verifyResult.result).toBe(true);

      const state = ledger(verifyResult.context.currentQueryContext.state);
      expect(state.activeMilestoneStatus).toBe(2n); // VERIFIED
    });

    it('7. throws assertion failure when private metric is strictly below threshold', () => {
      const failingMetric = 89n;
      const threshold = 92n;

      const contract = createMockContract({ metric: failingMetric });
      const initialCtx = getInitialCircuitContext(contract);

      const initCtx = contract.impureCircuits.initializeGrant(initialCtx, new Uint8Array(32), new Uint8Array(32), 3n).context;
      const configCtx = contract.impureCircuits.configureMilestone(initCtx, 1n, threshold, 250000n).context;

      expect(() => {
        contract.impureCircuits.verifyMilestoneZK(configCtx, 1n, 1788800300n);
      }).toThrow('Private milestone metric does not satisfy agreed threshold');
    });

    it('8. rejects verifying milestone when milestone is not in PENDING status', () => {
      const contract = createMockContract({ metric: 95n });
      const initialCtx = getInitialCircuitContext(contract);

      const initCtx = contract.impureCircuits.initializeGrant(initialCtx, new Uint8Array(32), new Uint8Array(32), 3n).context;
      const configCtx = contract.impureCircuits.configureMilestone(initCtx, 1n, 90n, 100000n).context;

      // First verification succeeds
      const firstVerify = contract.impureCircuits.verifyMilestoneZK(configCtx, 1n, 1788800400n);

      // Re-verifying a milestone that is already VERIFIED (status 2) fails
      expect(() => {
        contract.impureCircuits.verifyMilestoneZK(firstVerify.context, 1n, 1788800401n);
      }).toThrow('Milestone is not in PENDING status');
    });
  });

  describe('Circuit 4 & 5: authorizeTrancheRelease & openDisputeWindow', () => {
    it('9. opens dispute window on verified milestone, disabling tranche release', () => {
      const contract = createMockContract({ metric: 95n });
      const initialCtx = getInitialCircuitContext(contract);

      const initCtx = contract.impureCircuits.initializeGrant(initialCtx, new Uint8Array(32), new Uint8Array(32), 3n).context;
      const configCtx = contract.impureCircuits.configureMilestone(initCtx, 1n, 90n, 100000n).context;
      const verifyCtx = contract.impureCircuits.verifyMilestoneZK(configCtx, 1n, 1788800500n).context;

      const disputeRes = contract.impureCircuits.openDisputeWindow(verifyCtx, 1n);
      expect(disputeRes.result).toBe(true);

      const state = ledger(disputeRes.context.currentQueryContext.state);
      expect(state.activeMilestoneStatus).toBe(3n); // DISPUTED
      expect(state.isTrancheReleasable).toBe(false);
    });

    it('10. rejects dispute opening on an unverified milestone', () => {
      const contract = createMockContract();
      const initialCtx = getInitialCircuitContext(contract);

      const initCtx = contract.impureCircuits.initializeGrant(initialCtx, new Uint8Array(32), new Uint8Array(32), 3n).context;
      const configCtx = contract.impureCircuits.configureMilestone(initCtx, 1n, 90n, 100000n).context;

      expect(() => {
        contract.impureCircuits.openDisputeWindow(configCtx, 1n);
      }).toThrow('Can only dispute a verified milestone');
    });
  });

  describe('Privacy Invariant Verification', () => {
    it('11. verifies zero private witness leakage to on-chain ledger state', () => {
      const confidentialMetric = 99876n;
      const contract = createMockContract({ metric: confidentialMetric });
      const initialCtx = getInitialCircuitContext(contract);

      const initCtx = contract.impureCircuits.initializeGrant(initialCtx, new Uint8Array(32), new Uint8Array(32), 3n).context;
      const configCtx = contract.impureCircuits.configureMilestone(initCtx, 1n, 90n, 100000n).context;
      const verifyCtx = contract.impureCircuits.verifyMilestoneZK(configCtx, 1n, 1788800600n).context;

      const onChainLedger = ledger(verifyCtx.currentQueryContext.state);

      // Verify that public ledger ONLY exposes safe metadata
      expect(onChainLedger.isInitialized).toBe(true);
      expect(onChainLedger.activeMilestoneStatus).toBe(2n);
      expect(onChainLedger.isTrancheReleasable).toBe(true);

      // Verify strict absence of private witness data
      expect((onChainLedger as any).privateMetric).toBeUndefined();
      expect((onChainLedger as any).getPrivateMetric).toBeUndefined();
      expect((onChainLedger as any).privateSalt).toBeUndefined();
      expect((onChainLedger as any).evidenceHash).toBeUndefined();
      expect((onChainLedger as any).funderAuthSecret).toBeUndefined();
    });
  });
});

