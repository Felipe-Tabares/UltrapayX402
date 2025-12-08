/**
 * Servicio de redes blockchain
 * Maneja información de diferentes redes y chains
 */

export interface NetworkInfo {
  name: string;
  chainId: number;
  chainIdHex: string;
  rpcUrl: string;
  explorer: string;
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
}

// Mapeo de networks (string) a chainIds
const networkToChainId: { [key: string]: number } = {
  'base-sepolia': 84532,
  'avalanche-fuji': 43113,
  'base': 8453,
  'avalanche': 43114,
  'ethereum': 1,
  'sepolia': 11155111,
  'polygon': 137,
  'polygon-mumbai': 80001
};

// Información completa de cada red
const networkInfo: { [key: number]: NetworkInfo } = {
  84532: {
    name: 'Base Sepolia',
    chainId: 84532,
    chainIdHex: '0x14a34',
    rpcUrl: 'https://sepolia.base.org',
    explorer: 'https://sepolia-explorer.base.org/',
    nativeCurrency: {
      name: 'ETH',
      symbol: 'ETH',
      decimals: 18
    }
  },
  43113: {
    name: 'Avalanche Fuji',
    chainId: 43113,
    chainIdHex: '0xa869',
    rpcUrl: 'https://api.avax-test.network/ext/bc/C/rpc',
    explorer: 'https://testnet.snowtrace.io/',
    nativeCurrency: {
      name: 'AVAX',
      symbol: 'AVAX',
      decimals: 18
    }
  },
  8453: {
    name: 'Base',
    chainId: 8453,
    chainIdHex: '0x2105',
    rpcUrl: 'https://mainnet.base.org',
    explorer: 'https://basescan.org/',
    nativeCurrency: {
      name: 'ETH',
      symbol: 'ETH',
      decimals: 18
    }
  },
  43114: {
    name: 'Avalanche',
    chainId: 43114,
    chainIdHex: '0xa86a',
    rpcUrl: 'https://api.avax.network/ext/bc/C/rpc',
    explorer: 'https://snowtrace.io/',
    nativeCurrency: {
      name: 'AVAX',
      symbol: 'AVAX',
      decimals: 18
    }
  },
  1: {
    name: 'Ethereum Mainnet',
    chainId: 1,
    chainIdHex: '0x1',
    rpcUrl: 'https://eth.llamarpc.com',
    explorer: 'https://etherscan.io/',
    nativeCurrency: {
      name: 'ETH',
      symbol: 'ETH',
      decimals: 18
    }
  },
  11155111: {
    name: 'Sepolia',
    chainId: 11155111,
    chainIdHex: '0xaa36a7',
    rpcUrl: 'https://rpc.sepolia.org',
    explorer: 'https://sepolia.etherscan.io/',
    nativeCurrency: {
      name: 'ETH',
      symbol: 'ETH',
      decimals: 18
    }
  },
  137: {
    name: 'Polygon',
    chainId: 137,
    chainIdHex: '0x89',
    rpcUrl: 'https://polygon-rpc.com',
    explorer: 'https://polygonscan.com/',
    nativeCurrency: {
      name: 'MATIC',
      symbol: 'MATIC',
      decimals: 18
    }
  },
  80001: {
    name: 'Polygon Mumbai',
    chainId: 80001,
    chainIdHex: '0x13881',
    rpcUrl: 'https://rpc-mumbai.maticvigil.com',
    explorer: 'https://mumbai.polygonscan.com/',
    nativeCurrency: {
      name: 'MATIC',
      symbol: 'MATIC',
      decimals: 18
    }
  }
};

/**
 * Obtiene el chainId de un network string
 */
export function getChainIdFromNetwork(network: string): number | null {
  const normalizedNetwork = network.toLowerCase().trim();
  return networkToChainId[normalizedNetwork] || null;
}

/**
 * Obtiene información completa de una red por chainId
 */
export function getNetworkInfo(chainId: number): NetworkInfo | null {
  return networkInfo[chainId] || null;
}

/**
 * Obtiene información completa de una red por network string
 */
export function getNetworkInfoByString(network: string): NetworkInfo | null {
  const chainId = getChainIdFromNetwork(network);
  if (!chainId) {
    return null;
  }
  return getNetworkInfo(chainId);
}

/**
 * Verifica si un network está soportado
 */
export function isNetworkSupported(network: string): boolean {
  return getChainIdFromNetwork(network) !== null;
}

/**
 * Obtiene la lista de networks soportados
 */
export function getSupportedNetworks(): string[] {
  return Object.keys(networkToChainId);
}

/**
 * Obtiene el chainId en formato hexadecimal
 */
export function getChainIdHex(network: string): string | null {
  const info = getNetworkInfoByString(network);
  return info?.chainIdHex || null;
}

/**
 * Obtiene el nombre legible de una red
 */
export function getNetworkName(network: string): string {
  const info = getNetworkInfoByString(network);
  return info?.name || network;
}
