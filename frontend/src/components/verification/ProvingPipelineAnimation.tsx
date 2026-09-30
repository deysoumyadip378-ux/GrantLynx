import React from 'react';
import { Lock, Cpu, Database, Check, ArrowRight, ShieldCheck, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

interface ProvingPipelineAnimationProps {
  isProving: boolean;
  isSettled: boolean;
  disclosedStatus?: string;
  txHash?: string;
}

export const ProvingPipelineAnimation: React.FC<ProvingPipelineAnimationProps> = ({
  isProving,
  isSettled,
  disclosedStatus = 'PENDING',
  txHash,
}) => {
  return (
    <div className="py-6 my-6 border-y border-slate-800/80">
      <div className="text-center mb-5">
        <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400">
          Cryptographic Pipeline Flow
        </span>
        <h4 className="text-sm font-display font-bold text-white mt-0.5">
          Dual-State Zero-Knowledge Data Isolation
        </h4>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 relative">
        {/* Node 1: Client Private State */}
        <div className={`p-4 rounded-xl border transition-all ${
          isProving
            ? 'bg-midnight-900 border-lynx-amber/60 shadow-lg shadow-lynx-amber/10'
            : 'bg-midnight-950/70 border-slate-800'
        }`}>
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-mono uppercase text-slate-400">1. Private Witness</span>
            <div className="p-1.5 rounded-lg bg-lynx-amber/20 text-lynx-amber">
              <Lock className="w-3.5 h-3.5" />
            </div>
          </div>
          <h5 className="text-xs font-display font-semibold text-white">Client Memory Vault</h5>
          <p className="text-[11px] text-slate-400 mt-1 leading-snug">
            Raw metric and proprietary evidence remain in volatile browser RAM. Never uploaded.
          </p>
          <div className="mt-3 flex items-center gap-1.5 text-[10px] font-mono text-lynx-amber">
            <span className="w-1.5 h-1.5 rounded-full bg-lynx-amber animate-pulse" />
            <span>Off-Chain Confidential</span>
          </div>
        </div>

        {/* Node 2: ZK Prover Circuit */}
        <div className={`p-4 rounded-xl border transition-all ${
          isProving
            ? 'bg-midnight-900 border-lynx-gold shadow-lg shadow-lynx-gold/20'
            : isSettled
            ? 'bg-midnight-900/90 border-lynx-gold/50'
            : 'bg-midnight-950/70 border-slate-800'
        }`}>
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-mono uppercase text-slate-400">2. Compact Circuit</span>
            <div className={`p-1.5 rounded-lg ${isProving ? 'bg-lynx-gold text-midnight-950 animate-bounce' : 'bg-lynx-gold/20 text-lynx-gold'}`}>
              <Zap className="w-3.5 h-3.5" />
            </div>
          </div>
          <h5 className="text-xs font-display font-semibold text-white">Zero-Knowledge Predicate</h5>
          <p className="text-[11px] text-slate-400 mt-1 leading-snug">
            Proves: <code className="text-slate-200">privateMetric ≥ threshold</code>. Generates SNARK proof & 32-byte commitment.
          </p>
          <div className="mt-3 flex items-center gap-1.5 text-[10px] font-mono text-lynx-gold">
            <span className="w-1.5 h-1.5 rounded-full bg-lynx-gold" />
            <span>{isProving ? 'Computing Proof...' : isSettled ? 'ZK-Proof Validated' : 'Ready to Prove'}</span>
          </div>
        </div>

        {/* Node 3: Public Ledger */}
        <div className={`p-4 rounded-xl border transition-all ${
          isSettled
            ? 'bg-midnight-900 border-lynx-bronze/60 shadow-lg shadow-lynx-bronze/10'
            : 'bg-midnight-950/70 border-slate-800'
        }`}>
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-mono uppercase text-slate-400">3. Public Ledger</span>
            <div className="p-1.5 rounded-lg bg-lynx-bronze/20 text-lynx-bronze">
              <Database className="w-3.5 h-3.5" />
            </div>
          </div>
          <h5 className="text-xs font-display font-semibold text-white">Midnight Blockchain</h5>
          <p className="text-[11px] text-slate-400 mt-1 leading-snug">
            Commits only: <code className="text-lynx-amber font-semibold">status = VERIFIED</code>, proof hash, and block timestamp.
          </p>
          <div className="mt-3 flex items-center gap-1.5 text-[10px] font-mono text-slate-300">
            <ShieldCheck className="w-3.5 h-3.5 text-lynx-amber" />
            <span>Settled State: <strong className="text-lynx-amber">{disclosedStatus}</strong></span>
          </div>
        </div>
      </div>
    </div>
  );
};

