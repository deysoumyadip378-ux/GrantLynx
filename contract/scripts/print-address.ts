import { Buffer } from 'node:buffer';
import { setNetworkId, getNetworkId } from '@midnight-ntwrk/midnight-js-network-id';
import { HDWallet, Roles, createKeystore } from '@midnight-ntwrk/wallet-sdk';
import { loadState } from './network.js';

function deriveKeys(seed: string) {
  const hdWallet = HDWallet.fromSeed(Buffer.from(seed, 'hex'));
  if (hdWallet.type !== 'seedOk') throw new Error('Invalid seed');
  const result = hdWallet.hdWallet
    .selectAccount(0)
    .selectRoles([Roles.NightExternal])
    .deriveKeysAt(0);
  if (result.type !== 'keysDerived') throw new Error('Key derivation failed');
  hdWallet.hdWallet.clear();
  return result.keys;
}

function main() {
  const state = loadState();
  if (!state || !state.wallets) {
    console.error('No wallets found in state file.');
    return;
  }

  for (const net of ['preview', 'preprod'] as const) {
    const creds = state.wallets[net];
    if (!creds) continue;

    setNetworkId(net);
    const networkId = getNetworkId();
    const keys = deriveKeys(creds.seed);
    const unshieldedKeystore = createKeystore(keys[Roles.NightExternal], networkId);
    const bech32Address = unshieldedKeystore.getBech32Address().toString();

    console.log(`\n================================================================`);
    console.log(`  NETWORK: ${net.toUpperCase()}`);
    console.log(`  VALID BECH32 ADDRESS:`);
    console.log(`  ${bech32Address}`);
    console.log(`  24-WORD RECOVERY PHRASE:`);
    console.log(`  ${creds.mnemonic}`);
    console.log(`================================================================\n`);
  }
}

main();

