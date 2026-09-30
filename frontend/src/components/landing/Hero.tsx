import React from 'react';
import { SplitText } from '../animations/SplitText.js';
import { BlurText } from '../animations/BlurText.js';
import { GradientText } from '../animations/GradientText.js';
import { ShinyText } from '../animations/ShinyText.js';
import { Shield, Lock, CheckCircle, ArrowRight, Zap, Coins } from 'lucide-react';

interface HeroProps {
  onStartVerification: () => void;
  onCreateGrant: () => void;
  activeNetwork: string;
}

export const Hero: React.FC<HeroProps> = ({
  onStartVerification,
  onCreateGrant,
  activeNetwork,
}) => {
  return (
    <section className="relative pt-8 pb-14 overflow-hidden">
      <div className="grantlynx-container">
        {/* Top Network Pill & Announcement */}
        <div className="flex justify-center mb-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-midnight-900/90 border border-slate-700/60 shadow-inner">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-lynx-amber opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-lynx-amber" />
            </span>
            <span className="text-xs font-mono text-slate-300">
              Midnight Network • <span className="text-lynx-amber font-semibold uppercase">{activeNetwork}</span> Validated
            </span>
          </div>
        </div>

        {/* Hero Headline & Sub-headline */}
        <div className="text-center max-w-4xl mx-auto mb-10">
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold font-display tracking-tight text-white leading-[1.15] mb-6">
            <SplitText text="Confidential Grant Milestone" className="block" />
            <span className="inline-block mt-1">
              <GradientText>Verification & Funding Release</GradientText>
            </span>
          </h1>

          <div className="max-w-2xl mx-auto text-slate-300 text-sm sm:text-base leading-relaxed font-sans">
            <BlurText
              text="Empower DAOs, foundations, and research funds to verify performance thresholds using zero-knowledge proofs. Recipients prove completion without disclosing proprietary source code or private datasets."
              delay={0.2}
            />
          </div>

          {/* Call to Actions */}
          <div className="flex flex-wrap items-center justify-center gap-4 mt-8">
            <button
              type="button"
              onClick={onStartVerification}
              className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-xl font-display font-semibold text-sm bg-gradient-to-r from-lynx-amber via-lynx-gold to-lynx-bronze text-midnight-950 hover:brightness-110 shadow-lg shadow-lynx-amber/20 transition-all select-none font-bold"
            >
              <ShinyText text="Verify Milestone Now" />
              <ArrowRight className="w-4 h-4 text-midnight-950 stroke-[2.5]" />
            </button>
            <button
              type="button"
              onClick={onCreateGrant}
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl font-display font-semibold text-sm bg-midnight-900/90 border border-slate-700/80 hover:border-lynx-amber/50 text-slate-200 hover:text-white transition-all select-none"
            >
              <Coins className="w-4 h-4 text-lynx-gold" />
              Funder Policy Engine
            </button>
          </div>
        </div>

        {/* Hero Artwork Image with Glass Frame */}
        <div className="relative max-w-5xl mx-auto mt-6 mb-12 rounded-2xl overflow-hidden border border-slate-800/80 shadow-2xl glass-panel p-2">
          <div className="relative rounded-xl overflow-hidden aspect-[16/9] max-h-[460px]">
            <img
              src="/assets/grantlynx_hero_banner.jpg"
              alt="GrantLynx ZK Pipeline Architecture"
              className="w-full h-full object-cover object-center transform hover:scale-[1.01] transition-transform duration-700"
            />
            {/* Subtle Gradient Vignette */}
            <div className="absolute inset-0 bg-gradient-to-t from-midnight-950 via-transparent to-transparent opacity-60" />

            {/* In-Artwork Overlay Badge */}
            <div className="absolute bottom-4 left-4 right-4 flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-xl bg-midnight-950/80 backdrop-blur-md border border-slate-800/80 text-xs">
              <div className="flex items-center gap-2 text-slate-300">
                <Lock className="w-4 h-4 text-lynx-amber" />
                <span>Zero-Knowledge ProofStation: <strong>Client Memory Isolated</strong></span>
              </div>
              <div className="flex items-center gap-3 text-slate-400 font-mono text-[11px]">
                <span>Compact 0.5.2</span>
                <span>•</span>
                <span className="text-lynx-gold">Disclosed Booleans Only</span>
              </div>
            </div>
          </div>
        </div>

        {/* 4-Stage Architectural Pipeline Flow */}
        <div className="max-w-5xl mx-auto mt-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            {/* Stage 1 */}
            <div className="glass-panel p-4 rounded-xl flex items-start gap-3">
              <div className="p-2 rounded-lg bg-lynx-amber/20 text-lynx-amber border border-lynx-amber/30 shrink-0">
                <Coins className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Step 1</span>
                <h4 className="text-xs font-display font-bold text-white mt-0.5">Grant Reserve</h4>
                <p className="text-[11px] text-slate-400 leading-tight mt-1">
                  Funder locks tranche policy and threshold criteria on Midnight.
                </p>
              </div>
            </div>

            {/* Stage 2 */}
            <div className="glass-panel p-4 rounded-xl flex items-start gap-3">
              <div className="p-2 rounded-lg bg-lynx-gold/20 text-lynx-gold border border-lynx-gold/30 shrink-0">
                <Lock className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Step 2</span>
                <h4 className="text-xs font-display font-bold text-white mt-0.5">Private Evidence</h4>
                <p className="text-[11px] text-slate-400 leading-tight mt-1">
                  Recipient loads internal metrics into local browser memory.
                </p>
              </div>
            </div>

            {/* Stage 3 */}
            <div className="glass-panel p-4 rounded-xl flex items-start gap-3">
              <div className="p-2 rounded-lg bg-lynx-bronze/20 text-lynx-bronze border border-lynx-bronze/30 shrink-0">
                <Zap className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Step 3</span>
                <h4 className="text-xs font-display font-bold text-white mt-0.5">ZK Polynomial Proof</h4>
                <p className="text-[11px] text-slate-400 leading-tight mt-1">
                  Circuit mathematically asserts metric ≥ threshold without revealing value.
                </p>
              </div>
            </div>

            {/* Stage 4 */}
            <div className="glass-panel p-4 rounded-xl flex items-start gap-3">
              <div className="p-2 rounded-lg bg-lynx-copper/20 text-lynx-copper border border-lynx-copper/30 shrink-0">
                <CheckCircle className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Step 4</span>
                <h4 className="text-xs font-display font-bold text-white mt-0.5">Tranche Release</h4>
                <p className="text-[11px] text-slate-400 leading-tight mt-1">
                  On-chain status verifies and unlocks tranche funding automatically.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

