import { WebSocket } from 'ws';
import { resolveNetwork, getOrCreateWallet, formatWalletBackupNotice } from './network.js';
import { createWallet, persistWalletState, unshieldedToken } from './wallet.js';

// @ts-expect-error WebSocket polyfill required in Node.js
globalThis.WebSocket = WebSocket;

async function main() {
  const { network, config: networkConfig } = resolveNetwork();
  const walletCreds = getOrCreateWallet(network);

  console.log('\n╔══════════════════════════════════════════════════════════════╗');
  console.log(`║           GrantLynx Wallet Checker (${network.toUpperCase()})           ║`);
  console.log('╚══════════════════════════════════════════════════════════════╝\n');

  const notice = formatWalletBackupNotice(walletCreds, network);
  if (notice) console.log(notice);

  try {
    console.log(`  Target Network: ${network.toUpperCase()}`);
    console.log(`  RPC Node:       ${networkConfig.node}`);
    console.log(`  Indexer:        ${networkConfig.indexer}`);
    console.log('  Building wallet keys and deriving Bech32 address...');

    const walletCtx = await createWallet({ network, networkConfig, seed: walletCreds.seed, restore: false });
    const address = walletCtx.unshieldedKeystore.getBech32Address().toString();

    console.log('\n─── Wallet Details ─────────────────────────────────────────────\n');
    console.log(`  📌 Address: ${address}`);
    console.log(`  🌐 Network: ${networkConfig.networkId}\n`);

    console.log('  Syncing with Midnight network...');
    console.log('  ℹ  Syncing chain headers (this takes a moment on public networks)...');

    const syncStart = Date.now();
    const syncInterval = setInterval(() => {
      const elapsed = Math.round((Date.now() - syncStart) / 1000);
      process.stdout.write(`\r  ⏳ Syncing with ${network}... (${elapsed}s elapsed)   `);
    }, 4000);

    const state = await new Promise<any>((resolve, reject) => {
      const sub = walletCtx.wallet.state().subscribe((s) => {
        const bal = s.unshielded?.balances?.[unshieldedToken().raw] ?? 0n;
        if (bal > 0n) {
          sub.unsubscribe();
          resolve(s);
        }
      });
      walletCtx.wallet.waitForSyncedState().then((s) => {
        sub.unsubscribe();
        resolve(s);
      }).catch(reject);
    });
    clearInterval(syncInterval);
    process.stdout.write('\r  ✓ Synced with network!                                      \n\n');

    const tNightBalance = state.unshielded.balances[unshieldedToken().raw] ?? 0n;
    const dustBalance = state.dust.balance(new Date());

    console.log('─── Current Balances ───────────────────────────────────────────\n');
    console.log(`  🪙 tNIGHT: ${tNightBalance.toLocaleString()}`);
    console.log(`  ⛽ DUST:   ${dustBalance.toLocaleString()}\n`);

    if (tNightBalance === 0n) {
      console.log('  ⚠️  WALLET IS NOT FUNDED YET:');
      if (networkConfig.faucet) {
        console.log(`  1. Open the Midnight Faucet:`);
        console.log(`     👉 ${networkConfig.faucet}`);
        console.log(`  2. Paste your wallet address:`);
        console.log(`     👉 ${address}`);
        console.log(`  3. Request tNIGHT tokens.`);
        console.log(`  4. Once received, run this script again or run deploy!\n`);
      }
    } else {
      console.log('  ✅ Wallet is funded with tNIGHT and ready for deployment!\n');
    }

    await persistWalletState(network, walletCtx);
    await walletCtx.wallet.stop();
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error checking balance:', error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

main();

