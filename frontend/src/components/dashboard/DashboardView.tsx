import React from 'react';
import { CountUp } from '../animations/CountUp.js';
import { TiltedCard } from '../animations/TiltedCard.js';
import { AnimatedList } from '../animations/AnimatedList.js';
import { ShinyText } from '../animations/ShinyText.js';
import { ShieldCheck, Plus, CheckCircle2, Clock, Coins, ExternalLink, ArrowRight, Layers } from 'lucide-react';
import type { NetworkId } from '../../config/networks.js';
import { getExplorerContractUrl } from '../../config/networks.js';

interface DashboardViewProps {
  networkId: NetworkId;
  contractAddress: string;
  onNavigateToVerify: () => void;
  onNavigateToCreate: () => void;
  milestoneVerified: boolean;
  trancheReleased: boolean;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  networkId,
  contractAddress,
  onNavigateToVerify,
  onNavigateToCreate,
  milestoneVerified,
  trancheReleased,
}) => {
  const explorerUrl = getExplorerContractUrl(networkId, contractAddress);

  return (
    <div className="space-y-8">
      {/* Top Stats Overview with CountUp */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Stat 1 */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-lynx-amber/20 text-lynx-amber border border-lynx-amber/30">
            <Coins className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wide">Total Committed Grants</span>
            <div className="text-2xl font-display font-extrabold text-white mt-0.5">
              ₹<CountUp to={2000000} duration={1.6} />
            </div>
            <span className="text-[10px] text-lynx-amber font-sans">Across 4 Program Tranches</span>
          </div>
        </div>

        {/* Stat 2 */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-lynx-gold/20 text-lynx-gold border border-lynx-gold/30">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wide">ZK Verified Milestones</span>
            <div className="text-2xl font-display font-extrabold text-white mt-0.5">
              <CountUp to={milestoneVerified ? 3 : 2} duration={1.2} /> / 4
            </div>
            <span className="text-[10px] text-lynx-gold font-sans">
              {milestoneVerified ? 'Latest Verified Just Now' : 'Milestone 3 Pending Proof'}
            </span>
          </div>
        </div>

        {/* Stat 3 */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-lynx-bronze/20 text-lynx-bronze border border-lynx-bronze/30">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wide">Disbursed Funds</span>
            <div className="text-2xl font-display font-extrabold text-white mt-0.5">
              ₹<CountUp to={trancheReleased ? 1500000 : 1000000} duration={1.8} />
            </div>
            <span className="text-[10px] text-slate-400 font-sans">
              {trancheReleased ? 'Tranches 1, 2, 3 Settled' : 'Tranche 3 Ready for Release'}
            </span>
          </div>
        </div>

        {/* Stat 4 */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-lynx-copper/20 text-lynx-copper border border-lynx-copper/30">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wide">Avg Verification Latency</span>
            <div className="text-2xl font-display font-extrabold text-white mt-0.5">
              <CountUp to={1.4} decimals={1} duration={1.0} suffix="s" />
            </div>
            <span className="text-[10px] text-lynx-copper font-sans">Client WASM ProofStation</span>
          </div>
        </div>
      </div>

      {/* Active Grant Programs Section */}
      <div>
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <div>
            <h3 className="text-lg font-display font-bold text-white">Active Grant Commitments</h3>
            <p className="text-xs text-slate-400">Privacy-preserving funding pipelines deployed on Midnight {networkId}</p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onNavigateToCreate}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-display font-semibold bg-midnight-800 hover:bg-midnight-700 border border-slate-700 text-slate-200 hover:text-white transition"
            >
              <Plus className="w-3.5 h-3.5 text-lynx-amber" />
              New Grant
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Grant Card 1 (Featured) */}
          <TiltedCard maxTilt={5}>
            <div className="glass-panel glass-panel-hover p-6 rounded-2xl border border-slate-700/80 space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase bg-lynx-amber/20 border border-lynx-amber/40 text-lynx-amber">
                    Active • Research Fund
                  </span>
                  <h4 className="text-base font-display font-bold text-white mt-2">
                    Deep Learning Medical Diagnostics Model
                  </h4>
                  <p className="text-xs text-slate-400 line-clamp-2 mt-1">
                    Grantor: HealthAI Global Foundation • Recipient: BioInference Labs
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-[10px] font-mono text-slate-400">Total Commitment</span>
                  <div className="text-sm font-display font-extrabold text-white">₹20,00,000</div>
                </div>
              </div>

              {/* Progress Tracker */}
              <div>
                <div className="flex justify-between text-xs text-slate-400 mb-1.5 font-mono">
                  <span>Milestone 3 of 4</span>
                  <span>{milestoneVerified ? '75% Complete' : '50% Complete'}</span>
                </div>
                <div className="w-full h-2 rounded-full bg-midnight-950 overflow-hidden border border-slate-800">
                  <div
                    className="h-full bg-gradient-to-r from-lynx-amber to-lynx-gold transition-all duration-500 rounded-full"
                    style={{ width: milestoneVerified ? '75%' : '50%' }}
                  />
                </div>
              </div>

              {/* Action and Explorer */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
                <a
                  href={explorerUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-mono text-slate-400 hover:text-lynx-amber transition"
                >
                  <span>Contract: {contractAddress.slice(0, 10)}...</span>
                  <ExternalLink className="w-3 h-3" />
                </a>

                <button
                  type="button"
                  onClick={onNavigateToVerify}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-display font-semibold bg-lynx-amber/20 hover:bg-lynx-amber/30 border border-lynx-amber/40 text-lynx-amber transition"
                >
                  <span>Verify M3</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          </TiltedCard>

          {/* Grant Card 2 */}
          <TiltedCard maxTilt={5}>
            <div className="glass-panel glass-panel-hover p-6 rounded-2xl border border-slate-700/80 space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase bg-lynx-gold/20 border border-lynx-gold/40 text-lynx-gold">
                    In Review • Web3 Infra
                  </span>
                  <h4 className="text-base font-display font-bold text-white mt-2">
                    High-Throughput Zero-Knowledge Indexer
                  </h4>
                  <p className="text-xs text-slate-400 line-clamp-2 mt-1">
                    Grantor: Midnight Innovation Grants • Recipient: Compact Labs
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-[10px] font-mono text-slate-400">Total Commitment</span>
                  <div className="text-sm font-display font-extrabold text-white">₹15,00,000</div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs text-slate-400 mb-1.5 font-mono">
                  <span>Milestone 1 of 3</span>
                  <span>33% Complete</span>
                </div>
                <div className="w-full h-2 rounded-full bg-midnight-950 overflow-hidden border border-slate-800">
                  <div className="h-full bg-lynx-gold transition-all duration-500 rounded-full" style={{ width: '33%' }} />
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
                <span className="text-xs font-mono text-slate-400">Next: Indexer Latency &lt; 500ms</span>
                <button
                  type="button"
                  onClick={onNavigateToVerify}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-display font-semibold bg-midnight-800 hover:bg-midnight-700 text-slate-300 transition"
                >
                  <span>Details</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          </TiltedCard>
        </div>
      </div>

      {/* Recent Immutable Audit Feed */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800">
        <h3 className="text-sm font-display font-bold text-white mb-4 flex items-center gap-2">
          <Layers className="w-4 h-4 text-lynx-amber" />
          Recent On-Chain Verification Feed
        </h3>

        <AnimatedList>
          {milestoneVerified && (
            <div className="p-3.5 rounded-xl bg-midnight-900/90 border border-lynx-amber/40 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-3">
                <span className="w-2 h-2 rounded-full bg-lynx-amber animate-ping" />
                <span className="font-display font-semibold text-white">
                  Milestone 3 Verified: AI Model Accuracy Condition Met (≥ 92%)
                </span>
              </div>
              <span className="text-[10px] font-mono text-lynx-amber">Just Now • Settled On-Chain</span>
            </div>
          )}
          <div className="p-3.5 rounded-xl bg-midnight-900/60 border border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-4 h-4 text-lynx-amber" />
              <span className="font-display text-slate-300">
                Milestone 2 Verified: Data Processing Scalability Benchmark (100k records)
              </span>
            </div>
            <span className="text-[10px] font-mono text-slate-500">2 days ago • Block #1419400</span>
          </div>
          <div className="p-3.5 rounded-xl bg-midnight-900/60 border border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-4 h-4 text-lynx-amber" />
              <span className="font-display text-slate-300">
                Milestone 1 Verified: Architecture Blueprint & Prototype Delivery
              </span>
            </div>
            <span className="text-[10px] font-mono text-slate-500">2 weeks ago • Block #1405100</span>
          </div>
        </AnimatedList>
      </div>
    </div>
  );
};

