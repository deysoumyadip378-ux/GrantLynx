import React, { useState } from 'react';
import { ClickSpark } from '../animations/ClickSpark.js';
import { ShieldAlert, Cpu, Sparkles, Check, RefreshCw, KeyRound, FileCheck } from 'lucide-react';
import type { ZkProofVerificationInput } from '../../services/contractService.js';

interface ClientProverViewProps {
  onExecuteProof: (input: ZkProofVerificationInput) => Promise<void>;
  isProving: boolean;
  activeMilestoneTitle: string;
  agreedThreshold: number;
  thresholdUnit: string;
}

export const ClientProverView: React.FC<ClientProverViewProps> = ({
  onExecuteProof,
  isProving,
  activeMilestoneTitle,
  agreedThreshold,
  thresholdUnit,
}) => {
  // FORM INPUT PHILOSOPHY:
  // All inputs initialized to clean empty strings (Zero mock defaults / dummy masked dots)
  const [metricValue, setMetricValue] = useState<string>('');
  const [evidenceName, setEvidenceName] = useState<string>('');
  const [customSalt, setCustomSalt] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const parsedMetric = parseFloat(metricValue);
    if (isNaN(parsedMetric)) {
      setErrorMessage('Please enter a valid numeric metric value to evaluate in the circuit');
      return;
    }

    if (!evidenceName.trim()) {
      setErrorMessage('Please provide an evidence reference identifier or dataset hash');
      return;
    }

    try {
      await onExecuteProof({
        milestoneId: 1,
        thresholdValue: agreedThreshold,
        privateMetricValue: parsedMetric,
        evidenceIdentifier: evidenceName.trim(),
        privateSalt: customSalt.trim() || undefined,
      });
    } catch (err: any) {
      setErrorMessage(err?.message || 'Proof verification failed');
    }
  };

  // Optional quick-fill chips for evaluator convenience (Pristine by default)
  const handleQuickFill = (metric: number, evidence: string) => {
    setMetricValue(String(metric));
    setEvidenceName(evidence);
    setErrorMessage(null);
  };

  const handleClear = () => {
    setMetricValue('');
    setEvidenceName('');
    setCustomSalt('');
    setErrorMessage(null);
  };

  return (
    <div className="glass-panel rounded-2xl p-6 sm:p-8 border border-slate-700/80 shadow-2xl relative overflow-hidden">
      {/* Client-Side Security Isolation Banner */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-6 mb-6 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-lynx-amber/20 text-lynx-amber border border-lynx-amber/30">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-mono uppercase tracking-wider text-lynx-amber font-semibold">
              Step 1 • Client-Side Prover
            </span>
            <h3 className="text-base sm:text-lg font-display font-bold text-white">
              Private Evidence Witness & ZK Proof Generator
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-midnight-900 border border-slate-700/80 text-[11px] text-slate-300">
          <KeyRound className="w-3.5 h-3.5 text-lynx-gold" />
          <span>Local Memory Isolated • Zero Transmission</span>
        </div>
      </div>

      {/* Target Milestone Active Contract Requirement */}
      <div className="mb-6 p-4 rounded-xl bg-midnight-900/90 border border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-mono text-slate-400 uppercase">Target Milestone</span>
          <h4 className="text-sm font-display font-semibold text-white">{activeMilestoneTitle}</h4>
        </div>
        <div className="text-right">
          <span className="text-[10px] font-mono text-slate-400 uppercase">Public Policy Threshold</span>
          <div className="text-base font-display font-extrabold text-lynx-amber">
            ≥ {agreedThreshold} {thresholdUnit}
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Field 1: Private Metric */}
          <div>
            <label className="block text-xs font-display font-semibold text-slate-200 mb-2">
              Confidential Measured Metric ({thresholdUnit}) <span className="text-lynx-amber">*</span>
            </label>
            <input
              type="number"
              step="any"
              value={metricValue}
              onChange={(e) => setMetricValue(e.target.value)}
              placeholder="e.g. 94.7 (Private witness - never leaves browser)"
              className="w-full px-4 py-3 rounded-xl bg-midnight-950/80 border border-slate-700 focus:border-lynx-amber focus:ring-1 focus:ring-lynx-amber outline-none text-white text-sm placeholder:text-slate-500 placeholder:italic font-mono transition"
            />
            <p className="text-[11px] text-slate-400 mt-1.5">
              The exact value is evaluated inside the Compact polynomial circuit and is <strong className="text-slate-300">never published on-chain</strong>.
            </p>
          </div>

          {/* Field 2: Evidence Identifier / File Hash */}
          <div>
            <label className="block text-xs font-display font-semibold text-slate-200 mb-2">
              Evidence Identifier or Dataset Hash <span className="text-lynx-amber">*</span>
            </label>
            <input
              type="text"
              value={evidenceName}
              onChange={(e) => setEvidenceName(e.target.value)}
              placeholder="e.g. eval_run_audit_v4.2.parquet or SHA-256 hash"
              className="w-full px-4 py-3 rounded-xl bg-midnight-950/80 border border-slate-700 focus:border-lynx-amber focus:ring-1 focus:ring-lynx-amber outline-none text-white text-sm placeholder:text-slate-500 placeholder:italic font-mono transition"
            />
            <p className="text-[11px] text-slate-400 mt-1.5">
              Reference identifier of the internal evidence repository or benchmark output.
            </p>
          </div>
        </div>

        {/* Optional Salt */}
        <div>
          <label className="block text-xs font-display font-semibold text-slate-200 mb-2">
            Blinding Salt (Optional • Auto-derived if blank)
          </label>
          <input
            type="text"
            value={customSalt}
            onChange={(e) => setCustomSalt(e.target.value)}
            placeholder="Auto-generated cryptographically secure 256-bit salt"
            className="w-full px-4 py-2.5 rounded-xl bg-midnight-950/80 border border-slate-800 text-xs font-mono text-slate-300 placeholder:text-slate-600 focus:border-slate-600 outline-none"
          />
        </div>

        {/* Quick Fill Chips for Tester Convenience */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className="text-[11px] text-slate-400 font-sans mr-1">Quick-Fill Examples:</span>
          <button
            type="button"
            onClick={() => handleQuickFill(94.7, 'eval_run_benchmark_res_94.7_model.pt')}
            className="px-2.5 py-1 rounded-lg text-xs font-mono bg-midnight-800/80 hover:bg-midnight-800 border border-slate-700/80 text-slate-300 hover:text-white transition"
          >
            AI Accuracy (94.7%)
          </button>
          <button
            type="button"
            onClick={() => handleQuickFill(92.0, 'ci_deploy_boundary_v3.bin')}
            className="px-2.5 py-1 rounded-lg text-xs font-mono bg-midnight-800/80 hover:bg-midnight-800 border border-slate-700/80 text-slate-300 hover:text-white transition"
          >
            Exact Boundary (92.0%)
          </button>
          <button
            type="button"
            onClick={() => handleQuickFill(88.4, 'failed_candidate_run.log')}
            className="px-2.5 py-1 rounded-lg text-xs font-mono bg-midnight-800/80 hover:bg-midnight-800 border border-slate-700/80 text-slate-300 hover:text-white transition"
          >
            Failing Test (88.4%)
          </button>
          {(metricValue || evidenceName) && (
            <button
              type="button"
              onClick={handleClear}
              className="px-2 py-1 rounded-lg text-xs font-mono text-lynx-rose hover:bg-lynx-rose/10 transition"
            >
              Clear
            </button>
          )}
        </div>

        {/* Error Feedback */}
        {errorMessage && (
          <div className="p-3.5 rounded-xl bg-lynx-rose/10 border border-lynx-rose/30 text-lynx-rose text-xs flex items-start gap-2.5">
            <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Submit Prover Action */}
        <div className="pt-2">
          <ClickSpark>
            <button
              type="submit"
              disabled={isProving}
              className={`w-full py-4 rounded-xl font-display font-bold text-sm tracking-wide transition-all shadow-lg flex items-center justify-center gap-2 select-none ${
                isProving
                  ? 'bg-slate-800 text-slate-400 cursor-wait'
                  : 'bg-gradient-to-r from-lynx-amber via-lynx-gold to-lynx-bronze text-midnight-950 hover:brightness-110 shadow-lynx-amber/20 font-bold'
              }`}
            >
              {isProving ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-lynx-amber" />
                  Generating Zero-Knowledge Polynomial Proof & Submitting to Midnight...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-midnight-950" />
                  Generate ZK Proof & Disclose Verified Outcome
                </>
              )}
            </button>
          </ClickSpark>
        </div>
      </form>
    </div>
  );
};

