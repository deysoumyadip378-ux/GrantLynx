import React from 'react';
import type { NetworkId } from '../../config/networks.js';
import { NETWORK_CONFIGS, getExplorerContractUrl } from '../../config/networks.js';
import { ExternalLink, ShieldCheck, Heart, Github } from 'lucide-react';

interface FooterProps {
  currentNetwork: NetworkId;
  contractAddress: string;
}

export const Footer: React.FC<FooterProps> = ({ currentNetwork, contractAddress }) => {
  const previewExplorer = getExplorerContractUrl('preview', NETWORK_CONFIGS.preview.contractAddress);
  const preprodExplorer = getExplorerContractUrl('preprod', NETWORK_CONFIGS.preprod.contractAddress);

  return (
    <footer className="mt-20 border-t border-slate-800/80 bg-midnight-950/90 backdrop-blur-md pt-12 pb-16 text-slate-400 text-xs">
      <div className="grantlynx-container">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Col 1 */}
          <div className="space-y-3">
            <div className="flex items-center gap-2.5">
              <img
                src="/assets/grantlynx_logo.jpg"
                alt="GrantLynx"
                className="w-7 h-7 rounded-lg object-cover border border-lynx-amber/30"
              />
              <span className="font-display font-extrabold text-white text-base">
                Grant<span className="text-lynx-amber">Lynx</span>
              </span>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed">
              Institutional Zero-Knowledge Milestone Verification & Automated Tranche Release Platform.
            </p>
            <div className="flex items-center gap-2 text-[11px] text-slate-500 font-mono">
              <ShieldCheck className="w-3.5 h-3.5 text-lynx-amber" />
              <span>Compact 0.5.2 • Midnight.js SDK</span>
            </div>
          </div>

          {/* Col 2 */}
          <div className="space-y-2">
            <h5 className="font-display font-semibold text-slate-200 text-xs tracking-wider uppercase">
              Network Deployments
            </h5>
            <ul className="space-y-1.5 font-mono text-[11px]">
              <li>
                <a
                  href={previewExplorer}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-lynx-amber transition flex items-center gap-1.5"
                >
                  <span>Preview: {NETWORK_CONFIGS.preview.contractAddress.slice(0, 10)}...</span>
                  <ExternalLink className="w-3 h-3 text-slate-500" />
                </a>
              </li>
              <li>
                <a
                  href={preprodExplorer}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-lynx-amber transition flex items-center gap-1.5"
                >
                  <span>Preprod: {NETWORK_CONFIGS.preprod.contractAddress.slice(0, 10)}...</span>
                  <ExternalLink className="w-3 h-3 text-slate-500" />
                </a>
              </li>
              <li className="text-slate-500 pt-1">
                Zero Docker Required for End-User Provers
              </li>
            </ul>
          </div>

          {/* Col 3 */}
          <div className="space-y-2">
            <h5 className="font-display font-semibold text-slate-200 text-xs tracking-wider uppercase">
              Privacy Guarantees
            </h5>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Private state (witnesses, secrets, datasets) never leaves client memory. The public ledger receives only 32-byte persistentHash commitments and disclosed booleans.
            </p>
          </div>

          {/* Col 4 */}
          <div className="space-y-2">
            <h5 className="font-display font-semibold text-slate-200 text-xs tracking-wider uppercase">
              Resources
            </h5>
            <ul className="space-y-1.5 text-[11px]">
              <li>
                <a
                  href="https://docs.midnight.network"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition flex items-center gap-1"
                >
                  <span>Midnight Network Docs</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </li>
              <li>
                <a
                  href="https://midnightexplorer.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition flex items-center gap-1"
                >
                  <span>Midnight Explorer</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </li>
              <li>
                <a
                  href="https://reactbits.dev"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition flex items-center gap-1"
                >
                  <span>React Bits UI Library</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-900 flex flex-wrap items-center justify-between gap-4 text-[11px] text-slate-500">
          <div>
            © 2026 GrantLynx Core. Licensed under Apache 2.0. Built for Midnight Builder Challenge.
          </div>
          <div className="flex items-center gap-4">
            <span>Powered by Midnight Zero-Knowledge Substrate</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

