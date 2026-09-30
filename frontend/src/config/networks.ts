export type NetworkId = 'preview' | 'preprod';

export interface NetworkConfig {
  networkId: NetworkId;
  displayName: string;
  rpc: string;
  indexer: string;
  indexerWS: string;
  explorer: string;
  faucet: string;
  contractAddress: string;
}

export const NETWORK_CONFIGS: Record<NetworkId, NetworkConfig> = {
  preview: {
    networkId: 'preview',
    displayName: 'Preview Testnet',
    rpc: 'https://rpc.preview.midnight.network',
    indexer: 'https://indexer.preview.midnight.network/api/v4/graphql',
    indexerWS: 'wss://indexer.preview.midnight.network/api/v4/graphql/ws',
    explorer: 'https://preview.midnightexplorer.com',
    faucet: 'https://faucet.preview.midnight.network',
    contractAddress: 'e81a34b2239611b855e9ea2796dc6c18f8e02613cfb2e67ef14cf3951f2115dc',
  },
  preprod: {
    networkId: 'preprod',
    displayName: 'Preprod Testnet',
    rpc: 'https://rpc.preprod.midnight.network',
    indexer: 'https://indexer.preprod.midnight.network/api/v4/graphql',
    indexerWS: 'wss://indexer.preprod.midnight.network/api/v4/graphql/ws',
    explorer: 'https://preprod.midnightexplorer.com',
    faucet: 'https://faucet.preprod.midnight.network',
    contractAddress: '68b0f1a1a952d5695c069f3328aa4841bab7ae38d16a116754ba548283f669b2',
  },
};

export function getExplorerContractUrl(networkId: NetworkId, contractAddress: string): string {
  const config = NETWORK_CONFIGS[networkId];
  return `${config.explorer}/contracts/${contractAddress}`;
}

export function getExplorerTxUrl(networkId: NetworkId, txHash: string): string {
  const config = NETWORK_CONFIGS[networkId];
  return `${config.explorer}/transactions/${txHash}`;
}

