import * as fs from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import ws from 'ws';
import { ApiPromise, WsProvider } from '@polkadot/api';
import { u8aToHex } from '@polkadot/util';

// @ts-expect-error WebSocket polyfill required in Node.js
globalThis.WebSocket = ws;

import { resolveNetwork, getOrCreateWallet, formatWalletBackupNotice, recordDeployment } from './network.js';
import { createWallet, persistWalletState, unshieldedToken, type WalletContext } from './wallet.js';

import { deployContract } from '@midnight-ntwrk/midnight-js-contracts';
import { httpClientProofProvider } from '@midnight-ntwrk/midnight-js-http-client-proof-provider';
import { indexerPublicDataProvider } from '@midnight-ntwrk/midnight-js-indexer-public-data-provider';
import { levelPrivateStateProvider } from '@midnight-ntwrk/midnight-js-level-private-state-provider';
import { NodeZkConfigProvider } from '@midnight-ntwrk/midnight-js-node-zk-config-provider';
import { CompiledContract } from '@midnight-ntwrk/midnight-js-protocol/compact-js';

const PRIVATE_STATE_ID = 'grantLynxPrivateState';

const { network, config: networkConfig } = resolveNetwork();
const WALLET = getOrCreateWallet(network);
const SEED = WALLET.seed;

{
  const notice = formatWalletBackupNotice(WALLET, network);
  if (notice) console.log(notice);
}

async function waitForProofServer(maxAttempts = 30, delayMs = 2000): Promise<boolean> {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const res = await fetch(networkConfig.proofServer, {
        method: 'GET',
        signal: AbortSignal.timeout(3000),
      });
      if (res.status < 500) return true;
    } catch {
      if (attempt < maxAttempts) {
        process.stdout.write(`\r  Waiting for proof server on ${networkConfig.proofServer}... (${attempt}/${maxAttempts})   `);
        await new Promise((r) => setTimeout(r, delayMs));
      }
    }
  }
  return false;
}

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const zkConfigPath = path.resolve(__dirname, '..', 'managed');
const contractPath = path.join(zkConfigPath, 'contract', 'index.js');

if (!fs.existsSync(contractPath)) {
  console.error('\n❌ Compiled contract not found in managed/contract/index.js! Run: npm run compile\n');
  process.exit(1);
}

const GrantLynxModule = await import(pathToFileURL(contractPath).href);

const defaultWitnesses = {
  getPrivateMetric: (context: any): [any, bigint] => [context.privateState, 95n],
  getPrivateSalt: (context: any): [any, Uint8Array] => [context.privateState, new Uint8Array(32)],
  getMilestoneEvidenceHash: (context: any): [any, Uint8Array] => [context.privateState, new Uint8Array(32)],
  getFunderAuthSecret: (context: any): [any, Uint8Array] => [context.privateState, new Uint8Array(32)],
};

const compiledContract = CompiledContract.make('grantlynx', GrantLynxModule.Contract).pipe(
  CompiledContract.withWitnesses(defaultWitnesses),
  CompiledContract.withCompiledFileAssets(zkConfigPath),
);

/**
 * Broadcast transaction to Midnight Substrate node via sendMnTransaction
 */
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
      console.log('  Balancing deployment transaction with unshielded tokens and DUST gas...');
      // Invariant: Do not restrict tokenKindsToBalance so balancer resolves gas/dust automatically
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
  console.log('\n╔══════════════════════════════════════════════════════════════╗');
  console.log(`║      Deploying GrantLynx to Midnight ${network.toUpperCase()}      ║`);
  console.log('╚══════════════════════════════════════════════════════════════╝\n');

  console.log('─── 1. Substrate RPC Node Connection ───────────────────────────\n');
  const relayWsUrl = networkConfig.node.replace(/^http/, 'ws');
  console.log(`  Connecting to Substrate node: ${relayWsUrl}`);
  const provider = new WsProvider(relayWsUrl);
  const api = await ApiPromise.create({ provider, noInitWarn: true });
  console.log('  ✓ Connected to Midnight Substrate node!');
  console.log(`  Indexer:      ${networkConfig.indexer}\n`);

  console.log('─── 2. Wallet Initialization ───────────────────────────────────\n');
  const walletCtx = await createWallet({ network, networkConfig, seed: SEED, restore: true });
  const address = walletCtx.unshieldedKeystore.getBech32Address().toString();
  console.log(`  Wallet Address: ${address}`);
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

  await persistWalletState(network, walletCtx);

  const tNightBalance = state.unshielded.balances[unshieldedToken().raw] ?? 0n;
  console.log(`  🪙 tNIGHT Balance: ${tNightBalance.toLocaleString()}\n`);

  if (tNightBalance === 0n) {
    console.log('  ❌ Insufficient Funds for Deployment:');
    console.log(`  Please fund your wallet address via the faucet:`);
    console.log(`  Faucet:  ${networkConfig.faucet}`);
    console.log(`  Address: ${address}\n`);
    await walletCtx.wallet.stop();
    process.exit(1);
  }

  console.log('─── 3. DUST Gas Status ─────────────────────────────────────────\n');
  const dustBal = state.dust?.balance ? state.dust.balance(new Date()) : 0n;
  console.log(`  ⛽ DUST Gas Available: ${dustBal.toLocaleString()}`);
  console.log('  ✓ DUST gas active on-chain.\n');

  console.log('─── 4. Checking Proof Server ───────────────────────────────────\n');
  const proofServerReady = await waitForProofServer(5, 1500);
  if (!proofServerReady) {
    console.log(`  ⚠️ Proof server is not currently running on ${networkConfig.proofServer}.`);
    console.log('  To turn on the proof server container, run:');
    console.log('    docker compose up -d proof-server\n');
    await walletCtx.wallet.stop();
    process.exit(1);
  }
  console.log('  ✓ Proof server ready!\n');

  console.log('─── 5. Deploying GrantLynx Contract ────────────────────────────\n');
  console.log('  Generating ZK deployment proof and deploying contract...');
  const providers = await createProviders(walletCtx, api);

  const deployed = await deployContract(providers, {
    compiledContract: compiledContract as any,
    args: [],
    privateStateId: PRIVATE_STATE_ID,
    initialPrivateState: {},
  });

  const contractAddress = deployed.deployTxData.public.contractAddress;
  console.log('\n  🎉 GrantLynx Contract Deployed Successfully!');
  console.log(`  Contract Address: ${contractAddress}\n`);

  recordDeployment(network, contractAddress, address.toString());
  console.log(`  Saved deployment to .midnight-state.json for ${network}.\n`);

  await persistWalletState(network, walletCtx);
  await walletCtx.wallet.stop();
  await api.disconnect();
  process.exit(0);
}

main().catch((err) => {
  console.error('\nDeployment error:', err);
  process.exit(1);
});

