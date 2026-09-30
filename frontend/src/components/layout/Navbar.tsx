import React from 'react';
import { PillNav } from '../animations/PillNav.js';
import type { NetworkId } from '../../config/networks.js';
import { ShieldCheck, Wallet, LogOut, Radio, Menu, X, ArrowUpRight } from 'lucide-react';

interface NavbarProps {
  currentNetwork: NetworkId;
  onNetworkChange: (net: NetworkId) => void;
  isConnected: boolean;
  isConnecting: boolean;
  address: string | null;
  activeProvider?: string | null;
  dustBalance?: string | null;
  onConnect: () => void;
  onDisconnect: () => void;
  activeTab: 'dashboard' | 'create' | 'verify' | 'audit';
  onTabChange: (tab: 'dashboard' | 'create' | 'verify' | 'audit') => void;
  onMobileMenuToggle: () => void;
  isMobileMenuOpen: boolean;
  blockHeight: number | null;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentNetwork,
  onNetworkChange,
  isConnected,
  isConnecting,
  address,
  activeProvider,
  dustBalance,
  onConnect,
  onDisconnect,
  activeTab,
  onTabChange,
  onMobileMenuToggle,
  isMobileMenuOpen,
  blockHeight,
}) => {
  const truncatedAddress = address
    ? `${address.slice(0, 12)}...${address.slice(-6)}`
    : '';

  return (
    <header className="sticky top-0 z-50 backdrop-blur-xl bg-midnight-950/85 border-b border-zinc-800/80 transition-all duration-200">
      <div className="grantlynx-container flex items-center justify-between h-20">
        {/* Brand Logo & Name */}
        <div className="flex items-center gap-4 cursor-pointer" onClick={() => onTabChange('dashboard')}>
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-lynx-amber to-lynx-gold rounded-2xl blur-md opacity-30 group-hover:opacity-75 transition duration-300" />
            <img
              src="/assets/grantlynx_logo.jpg"
              alt="GrantLynx Logo"
              className="relative w-11 h-11 rounded-xl object-cover border border-lynx-amber/40 shadow-lg shadow-black/50"
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-display font-extrabold text-xl tracking-tight text-white">
                Grant<span className="text-lynx-amber">Lynx</span>
              </span>
              <span className="hidden sm:inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-mono uppercase bg-midnight-900 border border-zinc-700 text-zinc-300">
                <span className="w-1.5 h-1.5 rounded-full bg-lynx-amber animate-pulse" />
                PREPROD LIVE
              </span>
            </div>
            <p className="hidden md:block text-[11px] text-zinc-400 font-sans tracking-wide">
              Confidential Grant Milestone Verification & Funding Release
            </p>
          </div>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-1.5 bg-midnight-900/80 p-1.5 rounded-full border border-zinc-800">
          <button
            type="button"
            onClick={() => onTabChange('dashboard')}
            className={`px-4 py-2 rounded-full text-xs font-display font-semibold transition-all ${
              activeTab === 'dashboard'
                ? 'bg-lynx-amber/15 text-lynx-amber border border-lynx-amber/40 shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Dashboard
          </button>
          <button
            type="button"
            onClick={() => onTabChange('verify')}
            className={`px-4 py-2 rounded-full text-xs font-display font-semibold transition-all ${
              activeTab === 'verify'
                ? 'bg-lynx-amber/15 text-lynx-amber border border-lynx-amber/40 shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Verify Milestones
          </button>
          <button
            type="button"
            onClick={() => onTabChange('create')}
            className={`px-4 py-2 rounded-full text-xs font-display font-semibold transition-all ${
              activeTab === 'create'
                ? 'bg-lynx-amber/15 text-lynx-amber border border-lynx-amber/40 shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Create Grant
          </button>
          <button
            type="button"
            onClick={() => onTabChange('audit')}
            className={`px-4 py-2 rounded-full text-xs font-display font-semibold transition-all ${
              activeTab === 'audit'
                ? 'bg-lynx-amber/15 text-lynx-amber border border-lynx-amber/40 shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Public Audit Ledger
          </button>
        </nav>

        {/* Right Controls: Network Switcher & Wallet Connect */}
        <div className="flex items-center gap-3">
          {/* Active Network Pill */}
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-midnight-900 border border-zinc-800 text-xs font-mono">
            <span className="w-2 h-2 rounded-full bg-lynx-amber animate-pulse" />
            <span className="text-zinc-200 font-semibold uppercase tracking-wider">Preprod</span>
            <span className="text-[10px] text-zinc-400 bg-zinc-800/80 px-1.5 py-0.5 rounded">Live</span>
          </div>

          {/* Wallet Action Button */}
          {isConnected ? (
            <div className="flex items-center gap-2">
              <div className="hidden sm:flex flex-col text-right">
                <span className="text-xs font-mono font-medium text-zinc-200 flex items-center gap-1.5 justify-end">
                  <ShieldCheck className="w-3.5 h-3.5 text-lynx-amber" />
                  {truncatedAddress}
                </span>
                <span className="text-[10px] text-zinc-400 font-sans">
                  {activeProvider || 'Midnight Preprod'} {dustBalance ? `• ${dustBalance}` : ''}
                </span>
              </div>
              <button
                type="button"
                onClick={onDisconnect}
                title="Disconnect Wallet"
                className="p-2.5 rounded-xl bg-midnight-900 border border-zinc-700/80 hover:border-lynx-rose/50 hover:bg-lynx-rose/10 text-zinc-300 hover:text-lynx-rose transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={onConnect}
              disabled={isConnecting}
              className="relative inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-display font-bold text-xs tracking-wide bg-gradient-to-r from-lynx-amber via-lynx-gold to-lynx-bronze text-midnight-950 hover:brightness-110 shadow-md shadow-lynx-amber/20 transition-all select-none touch-target"
            >
              <Wallet className="w-4 h-4 text-midnight-950" />
              {isConnecting ? 'Connecting...' : 'Connect Wallet'}
            </button>
          )}

          {/* Mobile Menu Hamburger */}
          <button
            type="button"
            onClick={onMobileMenuToggle}
            className="lg:hidden p-2.5 rounded-xl bg-midnight-900 border border-zinc-800 text-zinc-300 hover:text-white"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>
    </header>
  );
};

