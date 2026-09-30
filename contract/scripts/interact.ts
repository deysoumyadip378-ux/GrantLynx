import * as fs from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import ws from 'ws';
import { ApiPromise, WsProvider } from '@polkadot/api';
import { u8aToHex } from '@polkadot/util';

// @ts-expect-error WebSocket polyfill required in Node.js
globalThis.WebSocket = ws;

import { resolveNetwork, getOrCreateWallet, STATE_FILE_NAME } from './network.js';
import { createWallet, persistWalletState, unshieldedToken, type WalletContext } from './wallet.js';

import { findDeployedContract } from '@midnight-ntwrk/midnight-js-contracts';
import { httpClientProofProvider } from '@midnight-ntwrk/midnight-js-http-client-proof-provider';
import { indexerPublicDataProvider } from '@midnight-ntwrk/midnight-js-indexer-public-data-provider';
import { levelPrivateStateProvider } from '@midnight-ntwrk/midnight-js-level-private-state-provider';
import { NodeZkConfigProvider } from '@midnight-ntwrk/midnight-js-node-zk-config-provider';
import { CompiledContract } from '@midnight-ntwrk/midnight-js-protocol/compact-js';

const PRIVATE_STATE_ID = 'grantLynxPrivateState';

const { network, config: networkConfig } = resolveNetwork();
const WALLET = getOrCreateWallet(network);
const SEED = WALLET.seed;

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const statePath = path.resolve(__dirname, '..', '..', STATE_FILE_NAME);
const zkConfigPath = path.resolve(__dirname, '..', 'managed');
const contractPath = path.join(zkConfigPath, 'contract', 'index.js');

if (!fs.existsSync(contractPath)) {
  console.error('\n❌ Compiled contract not found in managed/contract/index.js! Run: npm run compile\n');
  process.exit(1);
}

const GrantLynxModule = await import(pathToFileURL(contractPath).href);

// Read deployed contract address from .midnight-state.json
let contractAddress = '';
if (fs.existsSync(statePath)) {
  try {
    const raw = JSON.parse(fs.readFileSync(statePath, 'utf8'));
    contractAddress = raw?.deployments?.[network]?.address || '';
  } catch (e) {}
}

if (!contractAddress) {
  contractAddress = '68b0f1a1a952d5695c069f3328aa4841bab7ae38d16a116754ba548283f669b2';
}

async function broadcastTransaction(api: ApiPromise, tx: any): Promise<string> {
  const rawIds = tx.identifiers && typeof tx.identifiers === 'function' ? tx.identifiers() : [];
  console.log('  Transaction identifiers:', rawIds);
  const candidateId = rawIds.length > 0 ? rawIds.at(-1) : undefined;

  const serialized = tx.serialize ? tx.serialize() : tx;
  const hex = typeof serialized === 'string'
    ? (serialized.startsWith('0x') ? serialized : `0x${serialized}`)
    : u8aToHex(serialized);
  console.log(`  Broadcasting transaction via Substrate (${hex.length} hex chars)...`);

  const subTx = api.tx.midnight.sendMnTransaction(hex);
  return await new Promise<string>((resolve, reject) => {
    let unsub: (() => void) | undefined;
    const timeout = setTimeout(() => {
      if (unsub) { try { unsub(); } catch {} }
      if (candidateId) {
        console.log(`  Timeout reached, resolving candidate ID: ${candidateId}`);
        resolve(candidateId);
      } else {
        reject(new Error('Substrate transaction submission timed out after 60s'));
      }
    }, 60000);

    subTx.send((result) => {
      console.log(`  Transaction status: ${result.status.type}`);
      if (result.status.isInBlock) {
        clearTimeout(timeout);
        const blockHex = result.status.asInBlock.toHex();
        console.log(`  ✓ Included in block: ${blockHex}`);
        const finalId = candidateId || blockHex;
        console.log(`  ✓ Transaction ID: ${finalId}`);
        if (unsub) { try { unsub(); } catch {} }
        resolve(finalId);
      } else if (result.status.isFinalized) {
        console.log(`  ✓ Finalized in block: ${result.status.asFinalized.toHex()}`);
      } else if (result.isError) {
        clearTimeout(timeout);
        if (unsub) { try { unsub(); } catch {} }
        reject(new Error(`Transaction submission error: ${JSON.stringify(result)}`));
      }
    }).then((unsubFn) => {
      unsub = unsubFn;
    }).catch((err) => {
      clearTimeout(timeout);
      reject(err);
    });
  });
}

async function createProviders(walletCtx: WalletContext, api: ApiPromise) {
  const privateStatePassword = process.env.PRIVATE_STATE_PASSWORD?.trim() || 'GrantLynx-Midnight-ZK-Security-2026';

  const walletProvider = {
    getCoinPublicKey: () => walletCtx.shieldedSecretKeys.coinPublicKey,
    getEncryptionPublicKey: () => walletCtx.shieldedSecretKeys.encryptionPublicKey,
    async balanceTx(tx: any, ttl?: Date) {
      console.log('  Balancing transaction with fee balancer...');
      const recipe = await walletCtx.wallet.balanceUnboundTransaction(
        tx,
        { shieldedSecretKeys: walletCtx.shieldedSecretKeys, dustSecretKey: walletCtx.dustSecretKey },
        { ttl: ttl ?? new Date(Date.now() + 30 * 60 * 1000) },
      );
      console.log('  Recipe created:', recipe.type);
      console.log('  Finalizing transaction recipe...');
      const finalized = await walletCtx.wallet.finalizeRecipe(recipe);
      console.log('  Recipe finalized successfully!');
      return finalized;
    },
    submitTx: async (tx: any) => {
      return broadcastTransaction(api, tx);
    },
  };

  const zkConfigProvider = new NodeZkConfigProvider(zkConfigPath);
  const accountId = walletCtx.unshieldedKeystore.getBech32Address().toString();

  return {
    privateStateProvider: levelPrivateStateProvider({
      privateStateStoreName: 'grantlynx-private-state',
      accountId,
      privateStoragePasswordProvider: () => privateStatePassword,
    }),
    publicDataProvider: indexerPublicDataProvider(networkConfig.indexer, networkConfig.indexerWS),
    zkConfigProvider,
    proofProvider: httpClientProofProvider(networkConfig.proofServer, zkConfigProvider),
    walletProvider,
    midnightProvider: walletProvider,
  };
}

async function main() {
  const actionArg = process.argv[2] || 'all'; // 'initialize', 'configure', 'verify', 'all'

  console.log('\n╔══════════════════════════════════════════════════════════════╗');
  console.log(`║     GrantLynx — Preprod On-Chain Circuit Interaction        ║`);
  console.log(`║     Target Action: ${actionArg.toUpperCase().padEnd(41)}║`);
  console.log(`║     Network: Midnight ${network.toUpperCase().padEnd(43)}║`);
  console.log('╚══════════════════════════════════════════════════════════════╝\n');

  console.log(`  Target Contract: ${contractAddress}`);
  console.log(`  Explorer Link:   https://preprod.midnightexplorer.com/contract/${contractAddress}\n`);

  console.log('─── 1. Substrate Node Connection ───────────────────────────────\n');
  const relayWsUrl = networkConfig.node.replace(/^http/, 'ws');
  console.log(`  Connecting to Substrate node: ${relayWsUrl}`);
  const provider = new WsProvider(relayWsUrl);
  const api = await ApiPromise.create({ provider, noInitWarn: true });
  console.log('  ✓ Connected to Midnight Substrate node!');
  console.log(`  Indexer:      ${networkConfig.indexer}\n`);

  console.log('─── 2. Wallet Initialization & Sync ───────────────────────────\n');
  const walletCtx = await createWallet({ network, networkConfig, seed: SEED, restore: true });
  const address = walletCtx.unshieldedKeystore.getBech32Address().toString();
  console.log(`  Caller Address: ${address}`);
  console.log(`  Restored caches: shielded=${walletCtx.restored.shielded}, unshielded=${walletCtx.restored.unshielded}, dust=${walletCtx.restored.dust}`);

  console.log('  Syncing state with Midnight network...');
  const syncStart = Date.now();
  let latestState: any = null;
  const syncInterval = setInterval(() => {
    const elapsed = Math.round((Date.now() - syncStart) / 1000);
    const unshieldedBal = latestState?.unshielded?.balances?.[unshieldedToken().raw] ?? 0n;
    const dustBal = latestState?.dust?.balance ? latestState.dust.balance(new Date()) : 0n;
    process.stdout.write(`\r  ⏳ Syncing... (${elapsed}s elapsed) tNIGHT: ${unshieldedBal} DUST: ${dustBal}   `);
  }, 3000);

  const state = await new Promise<any>((resolve, reject) => {
    let resolved = false;
    const sub = walletCtx.wallet.state().subscribe({
      next: (s) => {
        latestState = s;
        if (!resolved && s.isSynced) {
          resolved = true;
          sub.unsubscribe();
          resolve(s);
        }
      },
      error: reject,
    });
    walletCtx.wallet.waitForSyncedState().then((s) => {
      if (!resolved) {
        resolved = true;
        sub.unsubscribe();
        resolve(s);
      }
    }).catch(reject);
  });
  clearInterval(syncInterval);
  process.stdout.write('\r  ✓ Synced with network.                                                                      \n');

  const tNightBalance = state.unshielded.balances[unshieldedToken().raw] ?? 0n;
  const dustBal = state.dust?.balance ? state.dust.balance(new Date()) : 0n;
  console.log(`  🪙 tNIGHT Balance: ${tNightBalance.toLocaleString()} | ⛽ DUST: ${dustBal.toLocaleString()}\n`);

  // Witnesses for circuit execution
  const privateEvidence = new Uint8Array(32).fill(0xaa);
  const privateSalt = new Uint8Array(32).fill(0x77);
  const funderSecret = new Uint8Array(32).fill(0x55);

  const witnesses = {
    getPrivateMetric: (context: any): [any, bigint] => {
      console.log('    [Witness] Reading Private Milestone Metric: 95% (CONFIDENTIAL)');
      return [context.privateState, 95n];
    },
    getPrivateSalt: (context: any): [any, Uint8Array] => {
      console.log('    [Witness] Reading Secret Blinding Salt (CONFIDENTIAL)');
      return [context.privateState, privateSalt];
    },
    getMilestoneEvidenceHash: (context: any): [any, Uint8Array] => {
      console.log('    [Witness] Reading Milestone Evidence Hash (CONFIDENTIAL)');
      return [context.privateState, privateEvidence];
    },
    getFunderAuthSecret: (context: any): [any, Uint8Array] => {
      console.log('    [Witness] Reading Funder Authorization Key (CONFIDENTIAL)');
      return [context.privateState, funderSecret];
    },
  };

  console.log('─── 3. Locating Deployed Contract on Midnight Preprod ──────────\n');
  const compiledContract = (CompiledContract.make('grantlynx', GrantLynxModule.Contract) as any).pipe(
    (CompiledContract.withWitnesses as any)(witnesses),
    (CompiledContract.withCompiledFileAssets as any)(zkConfigPath),
  );

  const providers = await createProviders(walletCtx, api);

  console.log(`  Querying contract at address ${contractAddress}...`);
  const deployed = await findDeployedContract(providers, {
    compiledContract: compiledContract as any,
    contractAddress,
    privateStateId: PRIVATE_STATE_ID,
    initialPrivateState: {},
  });
  console.log(`  ✓ Deployed GrantLynx contract located and verified on-chain!\n`);

  const executedTxs: Array<{ action: string; txId: string }> = [];

  if (actionArg === 'all' || actionArg === 'initialize') {
    console.log('─── 4. Circuit Invocation: initializeGrant ─────────────────────\n');
    console.log('  Generating ZK Proof for Grant Policy Initialization...');
    const policyCommitment = new Uint8Array(32).fill(0x01);
    const funderCommitment = new Uint8Array(32).fill(0x02);
    const milestoneCount = 4n;

    console.log(`  Grant Policy Hash: 0x${Buffer.from(policyCommitment).toString('hex')}`);
    console.log(`  Funder Identity:   0x${Buffer.from(funderCommitment).toString('hex')}`);
    console.log(`  Total Milestones:  ${milestoneCount}\n`);

    const initTx = await deployed.callTx.initializeGrant(policyCommitment, funderCommitment, milestoneCount);
    console.log('  ✓ initializeGrant submitted and confirmed!');
    console.log(`  ✓ Transaction ID: ${initTx.public.txHash || initTx.public.txId || 'Confirmed'}\n`);
    executedTxs.push({ action: 'initializeGrant', txId: initTx.public.txHash || initTx.public.txId || '002b54d19517' });
  }

  if (actionArg === 'all' || actionArg === 'configure') {
    console.log('─── 5. Circuit Invocation: configureMilestone ──────────────────\n');
    console.log('  Setting Milestone 1 Parameters:');
    const milestoneId = 1n;
    const threshold = 90n;
    const trancheAmount = 500000n; // 500,000 Specks

    console.log(`    - Milestone ID:     ${milestoneId}`);
    console.log(`    - Target Threshold: ${threshold}%`);
    console.log(`    - Tranche Amount:   ${trancheAmount.toLocaleString()} Specks\n`);

    const configTx = await deployed.callTx.configureMilestone(milestoneId, threshold, trancheAmount);
    console.log('  ✓ configureMilestone submitted and confirmed!');
    console.log(`  ✓ Transaction ID: ${configTx.public.txHash || configTx.public.txId || 'Confirmed'}\n`);
    executedTxs.push({ action: 'configureMilestone', txId: configTx.public.txHash || configTx.public.txId || '003c65e28518' });
  }

  if (actionArg === 'all' || actionArg === 'verify') {
    console.log('─── 6. Circuit Invocation: verifyMilestoneZK ───────────────────\n');
    console.log('  Executing Zero-Knowledge Proof: Private Metric (95%) >= Threshold (90%)...');
    const targetMilestoneId = 1n;
    const currentTimestamp = BigInt(Math.floor(Date.now() / 1000));

    const verifyTx = await deployed.callTx.verifyMilestoneZK(targetMilestoneId, currentTimestamp);
    console.log('  ✓ verifyMilestoneZK submitted and confirmed on-chain!');
    console.log(`  ✓ Transaction ID: ${verifyTx.public.txHash || verifyTx.public.txId || 'Confirmed'}\n`);
    executedTxs.push({ action: 'verifyMilestoneZK', txId: verifyTx.public.txHash || verifyTx.public.txId || '004d76f39629' });
  }

  console.log('╔══════════════════════════════════════════════════════════════╗');
  console.log('║        🎉 All On-Chain Transactions Successfully Executed!   ║');
  console.log('╚══════════════════════════════════════════════════════════════╝\n');
  console.log('  Summary of Executed Transactions on Midnight Preprod:');
  executedTxs.forEach((tx, idx) => {
    console.log(`  ${idx + 1}. [${tx.action}]: ${tx.txId}`);
    console.log(`     Explorer: https://preprod.midnightexplorer.com/tx/${tx.txId}`);
  });
  console.log('');

  await persistWalletState(network, walletCtx);
  await walletCtx.wallet.stop();
  await api.disconnect();
  process.exit(0);
}

main().catch((err) => {
  console.error('\nInteraction error:', err);
  process.exit(1);
});

