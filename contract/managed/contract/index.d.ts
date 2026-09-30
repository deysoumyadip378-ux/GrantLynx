import type * as __compactRuntime from '@midnight-ntwrk/compact-runtime';

export type Witnesses<PS> = {
  getPrivateMetric(context: __compactRuntime.WitnessContext<Ledger, PS>): [PS, bigint];
  getPrivateSalt(context: __compactRuntime.WitnessContext<Ledger, PS>): [PS, Uint8Array];
  getMilestoneEvidenceHash(context: __compactRuntime.WitnessContext<Ledger, PS>): [PS, Uint8Array];
  getFunderAuthSecret(context: __compactRuntime.WitnessContext<Ledger, PS>): [PS, Uint8Array];
}

export type ImpureCircuits<PS> = {
  initializeGrant(context: __compactRuntime.CircuitContext<PS>,
                  policyHash_0: Uint8Array,
                  funderHash_0: Uint8Array,
                  milestoneCount_0: bigint): __compactRuntime.CircuitResults<PS, boolean>;
  configureMilestone(context: __compactRuntime.CircuitContext<PS>,
                     milestoneId_0: bigint,
                     threshold_0: bigint,
                     trancheAmount_0: bigint): __compactRuntime.CircuitResults<PS, boolean>;
  verifyMilestoneZK(context: __compactRuntime.CircuitContext<PS>,
                    targetMilestoneId_0: bigint,
                    currentTimestamp_0: bigint): __compactRuntime.CircuitResults<PS, boolean>;
  authorizeTrancheRelease(context: __compactRuntime.CircuitContext<PS>,
                          expectedFunderHash_0: Uint8Array): __compactRuntime.CircuitResults<PS, boolean>;
  openDisputeWindow(context: __compactRuntime.CircuitContext<PS>,
                    disputeMilestoneId_0: bigint): __compactRuntime.CircuitResults<PS, boolean>;
}

export type ProvableCircuits<PS> = {
  initializeGrant(context: __compactRuntime.CircuitContext<PS>,
                  policyHash_0: Uint8Array,
                  funderHash_0: Uint8Array,
                  milestoneCount_0: bigint): __compactRuntime.CircuitResults<PS, boolean>;
  configureMilestone(context: __compactRuntime.CircuitContext<PS>,
                     milestoneId_0: bigint,
                     threshold_0: bigint,
                     trancheAmount_0: bigint): __compactRuntime.CircuitResults<PS, boolean>;
  verifyMilestoneZK(context: __compactRuntime.CircuitContext<PS>,
                    targetMilestoneId_0: bigint,
                    currentTimestamp_0: bigint): __compactRuntime.CircuitResults<PS, boolean>;
  authorizeTrancheRelease(context: __compactRuntime.CircuitContext<PS>,
                          expectedFunderHash_0: Uint8Array): __compactRuntime.CircuitResults<PS, boolean>;
  openDisputeWindow(context: __compactRuntime.CircuitContext<PS>,
                    disputeMilestoneId_0: bigint): __compactRuntime.CircuitResults<PS, boolean>;
}

export type PureCircuits = {
}

export type Circuits<PS> = {
  initializeGrant(context: __compactRuntime.CircuitContext<PS>,
                  policyHash_0: Uint8Array,
                  funderHash_0: Uint8Array,
                  milestoneCount_0: bigint): __compactRuntime.CircuitResults<PS, boolean>;
  configureMilestone(context: __compactRuntime.CircuitContext<PS>,
                     milestoneId_0: bigint,
                     threshold_0: bigint,
                     trancheAmount_0: bigint): __compactRuntime.CircuitResults<PS, boolean>;
  verifyMilestoneZK(context: __compactRuntime.CircuitContext<PS>,
                    targetMilestoneId_0: bigint,
                    currentTimestamp_0: bigint): __compactRuntime.CircuitResults<PS, boolean>;
  authorizeTrancheRelease(context: __compactRuntime.CircuitContext<PS>,
                          expectedFunderHash_0: Uint8Array): __compactRuntime.CircuitResults<PS, boolean>;
  openDisputeWindow(context: __compactRuntime.CircuitContext<PS>,
                    disputeMilestoneId_0: bigint): __compactRuntime.CircuitResults<PS, boolean>;
}

export type Ledger = {
  readonly isInitialized: boolean;
  readonly grantPolicyCommitment: Uint8Array;
  readonly funderCommitment: Uint8Array;
  readonly totalMilestones: bigint;
  readonly activeMilestoneId: bigint;
  readonly activeThreshold: bigint;
  readonly activeTrancheAmount: bigint;
  readonly activeMilestoneStatus: bigint;
  readonly activeProofCommitment: Uint8Array;
  readonly isTrancheReleasable: boolean;
  readonly lastVerifiedTimestamp: bigint;
}

export type ContractReferenceLocations = any;

export declare const contractReferenceLocations : ContractReferenceLocations;

export declare class Contract<PS = any, W extends Witnesses<PS> = Witnesses<PS>> {
  witnesses: W;
  circuits: Circuits<PS>;
  impureCircuits: ImpureCircuits<PS>;
  provableCircuits: ProvableCircuits<PS>;
  constructor(witnesses: W);
  initialState(context: __compactRuntime.ConstructorContext<PS>): __compactRuntime.ConstructorResult<PS>;
}

export declare function ledger(state: __compactRuntime.StateValue | __compactRuntime.ChargedState): Ledger;
export declare const pureCircuits: PureCircuits;
