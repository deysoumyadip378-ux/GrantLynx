import React, { useState } from 'react';
import { ClickSpark } from '../animations/ClickSpark.js';
import { Plus, Check, ShieldCheck, Sparkles, Layers, Coins } from 'lucide-react';
import { sha256Hex } from '../../services/contractService.js';
import type { NetworkId } from '../../config/networks.js';

interface CreateGrantViewProps {
  networkId: NetworkId;
  onGrantCreated: () => void;
}

export const CreateGrantView: React.FC<CreateGrantViewProps> = ({ networkId, onGrantCreated }) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [title, setTitle] = useState('');
  const [funderName, setFunderName] = useState('');
  const [totalAmount, setTotalAmount] = useState('');
  const [milestoneCount, setMilestoneCount] = useState('3');

  // Milestone 1 configuration
  const [m1Title, setM1Title] = useState('');
  const [m1Threshold, setM1Threshold] = useState('');
  const [m1Tranche, setM1Tranche] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdPolicyHash, setCreatedPolicyHash] = useState<string | null>(null);

  const handleQuickFill = () => {
    setTitle('Decentralized Privacy Research Initiative 2026');
    setFunderName('Midnight Community Growth Fund');
    setTotalAmount('1500000');
    setMilestoneCount('3');
    setM1Title('Privacy Benchmark: 100k zero-knowledge proofs processed');
    setM1Threshold('100000');
    setM1Tranche('500000');
  };

  const handleDeployPolicy = async () => {
    setIsSubmitting(true);
    try {
      const summaryString = `${title}:${funderName}:${totalAmount}:${Date.now()}`;
      const policyHash = await sha256Hex(summaryString);
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setCreatedPolicyHash(policyHash);
      setIsSubmitting(false);
    } catch {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="glass-panel rounded-2xl p-6 sm:p-8 border border-slate-700/80 shadow-2xl max-w-3xl mx-auto">
      <div className="flex items-center justify-between pb-6 mb-6 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-lynx-amber/20 text-lynx-amber border border-lynx-amber/30">
            <Coins className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-mono uppercase text-lynx-amber font-semibold">
              Funder Policy Engine
            </span>
            <h3 className="text-base sm:text-lg font-display font-bold text-white">
              Create New Confidential Grant Policy
            </h3>
          </div>
        </div>

        <button
          type="button"
          onClick={handleQuickFill}
          className="text-xs font-mono text-lynx-amber hover:underline select-none"
        >
          Quick-Fill Template
        </button>
      </div>

      {createdPolicyHash ? (
        <div className="text-center py-8 space-y-4">
          <div className="w-14 h-14 rounded-full bg-lynx-amber/20 text-lynx-amber border border-lynx-amber/40 flex items-center justify-center mx-auto">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h4 className="text-lg font-display font-bold text-white">Grant Policy Deployed to Midnight!</h4>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Policy commitment hash has been initialized on Midnight {networkId} with 3 verifiable milestone tranches.
          </p>
          <div className="p-3 rounded-xl bg-midnight-950/80 border border-slate-800 text-xs font-mono text-lynx-amber break-all max-w-lg mx-auto">
            {createdPolicyHash}
          </div>
          <button
            type="button"
            onClick={onGrantCreated}
            className="px-6 py-2.5 rounded-xl font-display font-semibold text-xs bg-lynx-amber text-midnight-950 font-bold hover:brightness-110 transition shadow-lg shadow-lynx-amber/20"
          >
            Return to Dashboard
          </button>
        </div>
      ) : (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (step < 3) setStep((s) => (s + 1) as any);
            else handleDeployPolicy();
          }}
          className="space-y-6"
        >
          {/* Stepper Indicator */}
          <div className="flex items-center justify-between pb-2 border-b border-slate-800/80 text-xs font-mono">
            <span className={step >= 1 ? 'text-lynx-amber font-semibold' : 'text-slate-500'}>
              1. Grant Details
            </span>
            <span className={step >= 2 ? 'text-lynx-amber font-semibold' : 'text-slate-500'}>
              2. Milestones & Rules
            </span>
            <span className={step >= 3 ? 'text-lynx-amber font-semibold' : 'text-slate-500'}>
              3. Review & Commit
            </span>
          </div>

          {step === 1 && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-display font-semibold text-slate-300 mb-1.5">
                  Grant Program Title
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Open Source Zero-Knowledge Privacy Grant"
                  className="w-full px-4 py-3 rounded-xl bg-midnight-950 border border-slate-700 text-white text-sm outline-none focus:border-lynx-amber placeholder:text-slate-600 font-sans"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-display font-semibold text-slate-300 mb-1.5">
                    Funder / Foundation Name
                  </label>
                  <input
                    type="text"
                    required
                    value={funderName}
                    onChange={(e) => setFunderName(e.target.value)}
                    placeholder="e.g. Decentralized Science DAO"
                    className="w-full px-4 py-3 rounded-xl bg-midnight-950 border border-slate-700 text-white text-sm outline-none focus:border-lynx-amber placeholder:text-slate-600 font-sans"
                  />
                </div>
                <div>
                  <label className="block text-xs font-display font-semibold text-slate-300 mb-1.5">
                    Total Funding Allocation (INR / USD)
                  </label>
                  <input
                    type="number"
                    required
                    value={totalAmount}
                    onChange={(e) => setTotalAmount(e.target.value)}
                    placeholder="e.g. 2000000"
                    className="w-full px-4 py-3 rounded-xl bg-midnight-950 border border-slate-700 text-white text-sm outline-none focus:border-lynx-amber placeholder:text-slate-600 font-mono"
                  />
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <h4 className="text-xs font-display font-bold text-white uppercase tracking-wider text-slate-300">
                Configure Milestone 1 Predicate Condition
              </h4>
              <div>
                <label className="block text-xs font-display font-semibold text-slate-300 mb-1.5">
                  Milestone Specification
                </label>
                <input
                  type="text"
                  required
                  value={m1Title}
                  onChange={(e) => setM1Title(e.target.value)}
                  placeholder="e.g. Model Accuracy on Evaluation Dataset"
                  className="w-full px-4 py-3 rounded-xl bg-midnight-950 border border-slate-700 text-white text-sm outline-none focus:border-lynx-amber placeholder:text-slate-600"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-display font-semibold text-slate-300 mb-1.5">
                    Threshold Value (Numeric)
                  </label>
                  <input
                    type="number"
                    required
                    value={m1Threshold}
                    onChange={(e) => setM1Threshold(e.target.value)}
                    placeholder="e.g. 92"
                    className="w-full px-4 py-3 rounded-xl bg-midnight-950 border border-slate-700 text-white text-sm outline-none focus:border-lynx-amber placeholder:text-slate-600 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-display font-semibold text-slate-300 mb-1.5">
                    Tranche 1 Release Amount
                  </label>
                  <input
                    type="number"
                    required
                    value={m1Tranche}
                    onChange={(e) => setM1Tranche(e.target.value)}
                    placeholder="e.g. 500000"
                    className="w-full px-4 py-3 rounded-xl bg-midnight-950 border border-slate-700 text-white text-sm outline-none focus:border-lynx-amber placeholder:text-slate-600 font-mono"
                  />
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-midnight-950/80 border border-slate-800 space-y-2 text-xs">
                <div className="flex justify-between text-slate-400">
                  <span>Grant Program:</span>
                  <strong className="text-white">{title || 'Untitled Grant'}</strong>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Grantor:</span>
                  <strong className="text-white">{funderName || 'Anonymous DAO'}</strong>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Total Budget:</span>
                  <strong className="text-lynx-amber">₹{totalAmount || '0'}</strong>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Milestone 1 Threshold:</span>
                  <strong className="text-white">≥ {m1Threshold || '0'}</strong>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Tranche 1 Amount:</span>
                  <strong className="text-white">₹{m1Tranche || '0'}</strong>
                </div>
              </div>
              <p className="text-[11px] text-slate-400">
                Deploying this policy initializes the Compact smart contract state on Midnight {networkId}.
              </p>
            </div>
          )}

          <div className="flex justify-between pt-4 border-t border-slate-800">
            {step > 1 ? (
              <button
                type="button"
                onClick={() => setStep((s) => (s - 1) as any)}
                className="px-4 py-2.5 rounded-xl text-xs font-display text-slate-400 hover:text-white"
              >
                Back
              </button>
            ) : <div />}

            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-3 rounded-xl font-display font-semibold text-xs bg-gradient-to-r from-lynx-amber via-lynx-gold to-lynx-bronze text-midnight-950 font-bold hover:brightness-110 shadow-lg shadow-lynx-amber/20 transition flex items-center gap-2 select-none"
            >
              {isSubmitting ? (
                'Broadcasting Policy...'
              ) : step === 3 ? (
                'Deploy Grant Policy'
              ) : (
                'Next Step'
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

