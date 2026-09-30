import React, { useState } from 'react';
import { DecryptedText } from '../animations/DecryptedText.js';
import { HoldButton } from '../animations/HoldButton.js';
import { SpringCheck } from '../animations/SpringCheck.js';
import { getExplorerContractUrl, getExplorerTxUrl, type NetworkId } from '../../config/networks.js';
import { ExternalLink, Database, CheckCircle2, ShieldCheck, AlertCircle, FileText } from 'lucide-react';
import type { ZkProofResult } from '../../services/contractService.js';

interface PublicAuditLedgerProps {
  networkId: NetworkId;
  contractAddress: string;
  proofResult: ZkProofResult | null;
  onAuthorizeRelease: () => Promise<void>;
  isReleasing: boolean;
  trancheReleased: boolean;
}

export const PublicAuditLedger: React.FC<PublicAuditLedgerProps> = ({
  networkId,
  contractAddress,
  proofResult,
  onAuthorizeRelease,
  isReleasing,
  trancheReleased,
}) => {
  const explorerContractUrl = getExplorerContractUrl(networkId, contractAddress);
  const explorerTxUrl = proofResult ? getExplorerTxUrl(networkId, proofResult.settledTxHash) : '#';

  const mockLedgerState = {
    contractAddress,
    network: networkId,
    isInitialized: true,
    activeMilestoneStatus: proofResult?.isVerified ? (trancheReleased ? 4 : 2) : 1,
    statusString: proofResult?.isVerified ? (trancheReleased ? 'RELEASED' : 'VERIFIED') : 'PENDING',
    isTrancheReleasable: proofResult?.isVerified && !trancheReleased,
    proofCommitment: proofResult?.proofCommitment ?? '0000000000000000000000000000000000000000000000000000000000000000',
    lastVerifiedTimestamp: proofResult?.timestamp ?? 'Not verified yet',
    blockHeight: proofResult?.blockHeight ?? 1420950,
  };

  return (
    <div className="glass-panel rounded-2xl p-6 sm:p-8 border border-slate-700/80 shadow-2xl space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-6 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-lynx-amber/20 text-lynx-amber border border-lynx-amber/30">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-mono uppercase tracking-wider text-lynx-amber font-semibold">
              Step 2 • Verifier & Public Ledger Audit
            </span>
            <h3 className="text-base sm:text-lg font-display font-bold text-white">
              Immutable On-Chain Verification State
            </h3>
          </div>
        </div>

        {/* Deep-Linked Explorer Button */}
        <a
          href={explorerContractUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-midnight-900 hover:bg-midnight-800 border border-slate-700 hover:border-slate-500 text-xs font-mono text-slate-300 hover:text-white transition"
        >
          <span>Contract Explorer</span>
          <ExternalLink className="w-3.5 h-3.5 text-lynx-amber" />
        </a>
      </div>

      {/* Verification Outcome Summary Card */}
      <div className={`p-5 rounded-xl border transition-all ${
        proofResult?.isVerified
          ? 'bg-lynx-amber/10 border-lynx-amber/40'
          : 'bg-midnight-900/60 border-slate-800'
      }`}>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <SpringCheck checked={Boolean(proofResult?.isVerified)} size={28} />
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-display font-bold text-white">
                  Milestone Status:{' '}
                  <span className={proofResult?.isVerified ? 'text-lynx-amber' : 'text-slate-400'}>
                    {mockLedgerState.statusString}
                  </span>
                </h4>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {proofResult?.isVerified
                  ? 'Zero-knowledge verification succeeded. Public ledger confirms predicate satisfaction without disclosing raw metric.'
                  : 'Awaiting client-side zero-knowledge proof generation above.'}
              </p>
            </div>
          </div>

          {proofResult?.isVerified && (
            <div className="text-right">
              <span className="text-[10px] font-mono text-slate-400 uppercase">Verification Latency</span>
              <div className="text-xs font-mono text-slate-200">
                {proofResult.verificationLatencyMs} ms
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Cryptographic Proof Commitment & Transaction Details */}
      {proofResult && (
        <div className="p-4 rounded-xl bg-midnight-950/90 border border-slate-800 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
              On-Chain 32-Byte Proof Commitment
            </span>
            <span className="text-[10px] font-mono text-lynx-gold">SHA-256 persistentHash</span>
          </div>

          <div className="p-2.5 rounded-lg bg-midnight-900 border border-slate-800 text-xs text-lynx-amber break-all">
            <DecryptedText text={proofResult.proofCommitment} speed={20} />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 text-xs">
            <div className="flex items-center gap-2 text-slate-400 font-mono text-[11px]">
              <span>Settled Block: #{proofResult.blockHeight}</span>
              <span>•</span>
              <a
                href={explorerTxUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-lynx-gold hover:underline"
              >
                <span>Tx: {proofResult.settledTxHash.slice(0, 16)}...</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Tranche Release Execution Section (Only visible when verified) */}
      {proofResult?.isVerified && (
        <div className="p-5 rounded-xl bg-midnight-900/90 border border-slate-700/80">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
            <div>
              <span className="text-[10px] font-mono text-slate-400 uppercase">Funding Tranche 1</span>
              <h4 className="text-sm font-display font-bold text-white">
                Release Eligibility: {trancheReleased ? (
                  <span className="text-slate-400">Funds Settled ✓</span>
                ) : (
                  <span className="text-lynx-amber">Eligible for Immediate Release (₹5,00,000 / $6,000 USDC)</span>
                )}
              </h4>
            </div>
          </div>

          {!trancheReleased ? (
            <div>
              <p className="text-xs text-slate-400 mb-3">
                As the authorized funder, hold the button below to sign the on-chain release transaction with your private key witness:
              </p>
              <HoldButton
                onConfirm={onAuthorizeRelease}
                holdTime={1800}
                label="Hold to Authorize Tranche 1 Release"
                confirmedLabel="Tranche 1 Released to Recipient Vault"
                disabled={isReleasing}
              />
            </div>
          ) : (
            <div className="p-3.5 rounded-lg bg-lynx-amber/20 border border-lynx-amber/40 text-xs text-lynx-amber flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>Tranche funds have been successfully released on-chain to the recipient account.</span>
            </div>
          )}
        </div>
      )}

      {/* Public Ledger State Terminal View */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-display font-semibold text-slate-300 flex items-center gap-2">
            <FileText className="w-3.5 h-3.5 text-slate-400" />
            Live Ledger Query Output
          </span>
          <span className="text-[10px] font-mono text-slate-500">Immutable JSON View</span>
        </div>
        <pre className="p-4 rounded-xl bg-midnight-950/90 border border-slate-800 text-[11px] font-mono text-slate-300 overflow-x-auto leading-relaxed">
          {JSON.stringify(mockLedgerState, null, 2)}
        </pre>
      </div>
    </div>
  );
};

