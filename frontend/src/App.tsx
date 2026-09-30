import React, { useState, useEffect } from 'react';
import { Navbar } from './components/layout/Navbar.js';
import { MobileDock } from './components/layout/MobileDock.js';
import { Footer } from './components/layout/Footer.js';
import { Hero } from './components/landing/Hero.js';
import { DashboardView } from './components/dashboard/DashboardView.js';
import { ClientProverView } from './components/verification/ClientProverView.js';
import { ProvingPipelineAnimation } from './components/verification/ProvingPipelineAnimation.js';
import { PublicAuditLedger } from './components/verification/PublicAuditLedger.js';
import { CreateGrantView } from './components/funder/CreateGrantView.js';

import { useMidnightWallet } from './hooks/useMidnightWallet.js';
import { NETWORK_CONFIGS, type NetworkId } from './config/networks.js';
import { fetchChainStatus } from './services/indexerService.js';
import {
  executeMilestoneProofZK,
  type ZkProofVerificationInput,
  type ZkProofResult,
} from './services/contractService.js';

export function App() {
  const [currentNetwork, setCurrentNetwork] = useState<NetworkId>('preprod');
  const [activeTab, setActiveTab] = useState<'dashboard' | 'create' | 'verify' | 'audit'>('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Live Blockchain Indexer Status
  const [blockHeight, setBlockHeight] = useState<number | null>(null);

  // Wallet integration
  const wallet = useMidnightWallet(currentNetwork);

  // Milestone Verification & Tranche Release States
  const [isProving, setIsProving] = useState(false);
  const [proofResult, setProofResult] = useState<ZkProofResult | null>(null);
  const [isReleasing, setIsReleasing] = useState(false);
  const [trancheReleased, setTrancheReleased] = useState(false);

  // Poll live blockchain telemetry from public GraphQL indexer
  useEffect(() => {
    let isMounted = true;
    const updateStatus = async () => {
      const status = await fetchChainStatus(currentNetwork);
      if (isMounted && status.blockHeight) {
        setBlockHeight(status.blockHeight);
      }
    };

    updateStatus();
    const interval = setInterval(updateStatus, 8000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [currentNetwork]);

  const activeContractAddress = NETWORK_CONFIGS[currentNetwork].contractAddress;

  // Execute ZK Proof Action
  const handleExecuteProof = async (input: ZkProofVerificationInput) => {
    setIsProving(true);
    try {
      const result = await executeMilestoneProofZK(input, currentNetwork);
      setProofResult(result);
      setIsProving(false);
    } catch (err) {
      setIsProving(false);
      throw err;
    }
  };

  // Authorize Tranche Release Action
  const handleAuthorizeRelease = async () => {
    setIsReleasing(true);
    await new Promise((resolve) => setTimeout(resolve, 1400));
    setTrancheReleased(true);
    setIsReleasing(false);
  };

  return (
    <div className="relative min-h-screen bg-midnight-950 text-slate-100 flex flex-col font-sans selection:bg-lynx-amber/20 selection:text-lynx-amber">
      {/* Custom Thematic Silk Ambient Backdrop (Zero Grid Lines) */}
      <div className="thematic-silk-bg" />

      {/* Top Navbar */}
      <Navbar
        currentNetwork={currentNetwork}
        onNetworkChange={(net) => setCurrentNetwork(net)}
        isConnected={wallet.isConnected}
        isConnecting={wallet.isConnecting}
        address={wallet.address}
        activeProvider={wallet.activeProvider}
        dustBalance={wallet.dustBalance}
        onConnect={() => wallet.connect()}
        onDisconnect={() => wallet.disconnect()}
        activeTab={activeTab}
        onTabChange={(tab) => {
          setActiveTab(tab);
          setIsMobileMenuOpen(false);
        }}
        onMobileMenuToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        isMobileMenuOpen={isMobileMenuOpen}
        blockHeight={blockHeight}
      />

      {/* Mobile Drawer Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-x-0 top-20 z-40 bg-midnight-950/95 border-b border-slate-800 p-6 backdrop-blur-2xl space-y-4">
          <div className="space-y-2">
            <button
              type="button"
              onClick={() => {
                setActiveTab('dashboard');
                setIsMobileMenuOpen(false);
              }}
              className="w-full text-left py-2 px-3 rounded-lg text-sm font-display font-medium text-slate-200 hover:bg-midnight-900"
            >
              Dashboard
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab('verify');
                setIsMobileMenuOpen(false);
              }}
              className="w-full text-left py-2 px-3 rounded-lg text-sm font-display font-medium text-slate-200 hover:bg-midnight-900"
            >
              Verify Milestones
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab('create');
                setIsMobileMenuOpen(false);
              }}
              className="w-full text-left py-2 px-3 rounded-lg text-sm font-display font-medium text-slate-200 hover:bg-midnight-900"
            >
              Create Grant
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab('audit');
                setIsMobileMenuOpen(false);
              }}
              className="w-full text-left py-2 px-3 rounded-lg text-sm font-display font-medium text-slate-200 hover:bg-midnight-900"
            >
              Public Audit Ledger
            </button>
          </div>

          <div className="pt-4 border-t border-slate-800 flex justify-between items-center">
            <span className="text-xs text-slate-400">Target Network:</span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setCurrentNetwork('preview')}
                className={`px-3 py-1 rounded-full text-xs font-mono ${
                  currentNetwork === 'preview'
                    ? 'bg-lynx-amber text-midnight-950 font-bold'
                    : 'bg-midnight-900 text-slate-400'
                }`}
              >
                Preview
              </button>
              <button
                type="button"
                onClick={() => setCurrentNetwork('preprod')}
                className={`px-3 py-1 rounded-full text-xs font-mono ${
                  currentNetwork === 'preprod'
                    ? 'bg-lynx-amber text-midnight-950 font-bold'
                    : 'bg-midnight-900 text-slate-400'
                }`}
              >
                Preprod
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="relative z-10 flex-1">
        {/* Hero Section displayed on Dashboard and Landing */}
        {activeTab === 'dashboard' && (
          <Hero
            onStartVerification={() => setActiveTab('verify')}
            onCreateGrant={() => setActiveTab('create')}
            activeNetwork={currentNetwork}
          />
        )}

        <div className="grantlynx-container py-8">
          {activeTab === 'dashboard' && (
            <DashboardView
              networkId={currentNetwork}
              contractAddress={activeContractAddress}
              onNavigateToVerify={() => setActiveTab('verify')}
              onNavigateToCreate={() => setActiveTab('create')}
              milestoneVerified={Boolean(proofResult?.isVerified)}
              trancheReleased={trancheReleased}
            />
          )}

          {activeTab === 'verify' && (
            <div className="max-w-4xl mx-auto space-y-6">
              <div className="text-center mb-4">
                <span className="text-[10px] font-mono uppercase tracking-widest text-lynx-amber font-semibold">
                  Zero-Knowledge Verification Portal
                </span>
                <h2 className="text-2xl sm:text-3xl font-display font-extrabold text-white mt-1">
                  Evaluate Milestone Predicate in ZK
                </h2>
                <p className="text-xs text-slate-400 max-w-lg mx-auto mt-1">
                  Recipient submits internal performance metrics. The circuit verifies the condition mathematically and settles on Midnight.
                </p>
              </div>

              {/* Spatial Flow 1: Client-Side Prover on Top */}
              <ClientProverView
                onExecuteProof={handleExecuteProof}
                isProving={isProving}
                activeMilestoneTitle="Milestone 3: AI Model Accuracy Benchmark (≥ 92% required)"
                agreedThreshold={92}
                thresholdUnit="%"
              />

              {/* Spatial Flow 2: Animated ZK Pipeline in Middle */}
              <ProvingPipelineAnimation
                isProving={isProving}
                isSettled={Boolean(proofResult?.isVerified)}
                disclosedStatus={proofResult?.disclosedStatus ?? 'PENDING'}
                txHash={proofResult?.settledTxHash}
              />

              {/* Spatial Flow 3: Public Verifier Audit at Bottom */}
              <PublicAuditLedger
                networkId={currentNetwork}
                contractAddress={activeContractAddress}
                proofResult={proofResult}
                onAuthorizeRelease={handleAuthorizeRelease}
                isReleasing={isReleasing}
                trancheReleased={trancheReleased}
              />
            </div>
          )}

          {activeTab === 'create' && (
            <CreateGrantView
              networkId={currentNetwork}
              onGrantCreated={() => setActiveTab('dashboard')}
            />
          )}

          {activeTab === 'audit' && (
            <div className="max-w-4xl mx-auto space-y-6">
              <div className="text-center mb-4">
                <span className="text-[10px] font-mono uppercase tracking-widest text-lynx-gold font-semibold">
                  Global Auditor & Observer Terminal
                </span>
                <h2 className="text-2xl sm:text-3xl font-display font-extrabold text-white mt-1">
                  Public Ledger Verification Records
                </h2>
                <p className="text-xs text-slate-400 max-w-lg mx-auto mt-1">
                  Inspect immutable cryptographic proofs committed to Midnight {currentNetwork}. Zero confidential data exposed.
                </p>
              </div>

              <PublicAuditLedger
                networkId={currentNetwork}
                contractAddress={activeContractAddress}
                proofResult={proofResult}
                onAuthorizeRelease={handleAuthorizeRelease}
                isReleasing={isReleasing}
                trancheReleased={trancheReleased}
              />
            </div>
          )}
        </div>
      </main>

      {/* Mobile Floating Dock Navigation (< 768px viewports) */}
      <MobileDock activeTab={activeTab} onTabChange={(tab) => setActiveTab(tab)} />

      {/* Footer */}
      <Footer currentNetwork={currentNetwork} contractAddress={activeContractAddress} />
    </div>
  );
}

export default App;

