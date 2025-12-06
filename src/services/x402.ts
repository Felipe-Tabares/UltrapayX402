/**
 * Servicio x402 para manejar pagos con el protocolo x402
 *
 * Este servicio utiliza viem para conectar con wallets y x402-fetch
 * para manejar automáticamente las respuestas 402 Payment Required.
 */

import { createWalletClient, custom, type WalletClient, type Account } from 'viem';
import { baseSepolia, base } from 'viem/chains';
import { config } from '../config';

// Tipos
export interface WalletState {
  isConnected: boolean;
  address: string | null;
  chainId: number | null;
  balance: string | null;
}

export interface PaymentResult {
  success: boolean;
  transactionHash?: string;
  error?: string;
}

// Estado global de la wallet
let walletClient: WalletClient | null = null;
let currentAccount: Account | null = null;

/**
 * Verifica si hay una wallet instalada (MetaMask, Core, etc.)
 */
export function hasWalletProvider(): boolean {
  return typeof window !== 'undefined' && typeof window.ethereum !== 'undefined';
}

/**
 * Obtiene la chain correcta según la configuración
 */
function getChain() {
  return config.x402.network === 'base-sepolia' ? baseSepolia : base;
}

/**
 * Conecta con la wallet del usuario
 * Usa wallet_requestPermissions para forzar la selección de wallet/cuenta
 */
export async function connectWallet(forceNewConnection: boolean = true): Promise<WalletState> {
  if (!hasWalletProvider()) {
    throw new Error('No se encontró una wallet. Instala MetaMask o Core Wallet.');
  }

  try {
    let accounts: string[];

    if (forceNewConnection) {
      // Forzar nueva selección de wallet/cuenta usando wallet_requestPermissions
      // Esto abre el popup de selección de cuenta
      try {
        await window.ethereum!.request({
          method: 'wallet_requestPermissions',
          params: [{ eth_accounts: {} }],
        });
      } catch (permError) {
        // Si el usuario cancela o hay error, intentar con eth_requestAccounts
        console.log('Permission request failed, falling back to eth_requestAccounts');
      }
    }

    // Obtener las cuentas después de la selección
    accounts = await window.ethereum!.request({
      method: 'eth_requestAccounts',
    }) as string[];

    if (!accounts || accounts.length === 0) {
      throw new Error('No se pudo conectar con la wallet');
    }

    const address = accounts[0];

    // Crear wallet client con viem
    walletClient = createWalletClient({
      chain: getChain(),
      transport: custom(window.ethereum!),
    });

    // Obtener chain ID actual
    const chainId = await window.ethereum!.request({
      method: 'eth_chainId',
    }) as string;

    // Obtener balance
    const balance = await window.ethereum!.request({
      method: 'eth_getBalance',
      params: [address, 'latest'],
    }) as string;

    // Convertir balance de wei a ether
    const balanceInEth = parseInt(balance, 16) / 1e18;

    return {
      isConnected: true,
      address,
      chainId: parseInt(chainId, 16),
      balance: balanceInEth.toFixed(4),
    };
  } catch (error) {
    console.error('Error connecting wallet:', error);
    throw error;
  }
}

/**
 * Desconecta la wallet y revoca permisos
 * Nota: No todas las wallets soportan revocar permisos programáticamente
 */
export async function disconnectWallet(): Promise<void> {
  walletClient = null;
  currentAccount = null;

  // Intentar revocar permisos (solo funciona en algunas wallets como MetaMask)
  if (hasWalletProvider()) {
    try {
      // Algunos proveedores soportan wallet_revokePermissions
      await window.ethereum!.request({
        method: 'wallet_revokePermissions',
        params: [{ eth_accounts: {} }],
      });
    } catch {
      // La mayoría de wallets no soportan esto, lo ignoramos
      console.log('Wallet does not support revokePermissions - user must disconnect manually from wallet');
    }
  }
}

/**
 * Abre el selector de cuentas para cambiar de dirección
 */
export async function switchAccount(): Promise<WalletState> {
  if (!hasWalletProvider()) {
    throw new Error('No wallet provider found');
  }

  try {
    // wallet_requestPermissions fuerza el popup de selección de cuenta
    await window.ethereum!.request({
      method: 'wallet_requestPermissions',
      params: [{ eth_accounts: {} }],
    });

    // Obtener la nueva cuenta seleccionada
    const accounts = await window.ethereum!.request({
      method: 'eth_accounts',
    }) as string[];

    if (!accounts || accounts.length === 0) {
      throw new Error('No account selected');
    }

    const address = accounts[0];

    // Actualizar wallet client
    walletClient = createWalletClient({
      chain: getChain(),
      transport: custom(window.ethereum!),
    });

    const chainId = await window.ethereum!.request({
      method: 'eth_chainId',
    }) as string;

    const balance = await window.ethereum!.request({
      method: 'eth_getBalance',
      params: [address, 'latest'],
    }) as string;

    const balanceInEth = parseInt(balance, 16) / 1e18;

    return {
      isConnected: true,
      address,
      chainId: parseInt(chainId, 16),
      balance: balanceInEth.toFixed(4),
    };
  } catch (error) {
    console.error('Error switching account:', error);
    throw error;
  }
}

/**
 * Obtiene el estado actual de la wallet
 */
export async function getWalletState(): Promise<WalletState> {
  if (!hasWalletProvider()) {
    return {
      isConnected: false,
      address: null,
      chainId: null,
      balance: null,
    };
  }

  try {
    const accounts = await window.ethereum!.request({
      method: 'eth_accounts',
    }) as string[];

    if (!accounts || accounts.length === 0) {
      return {
        isConnected: false,
        address: null,
        chainId: null,
        balance: null,
      };
    }

    const address = accounts[0];
    const chainId = await window.ethereum!.request({
      method: 'eth_chainId',
    }) as string;

    return {
      isConnected: true,
      address,
      chainId: parseInt(chainId, 16),
      balance: null, // Se puede obtener después si es necesario
    };
  } catch {
    return {
      isConnected: false,
      address: null,
      chainId: null,
      balance: null,
    };
  }
}

/**
 * Cambia a la red correcta para x402 (Base Sepolia para testnet)
 */
export async function switchToCorrectNetwork(): Promise<boolean> {
  if (!hasWalletProvider()) {
    throw new Error('No wallet provider found');
  }

  const targetChain = getChain();
  const targetChainIdHex = `0x${targetChain.id.toString(16)}`;

  try {
    await window.ethereum!.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: targetChainIdHex }],
    });
    return true;
  } catch (switchError: unknown) {
    // Si la chain no está añadida, intentar añadirla
    if ((switchError as { code?: number })?.code === 4902) {
      try {
        await window.ethereum!.request({
          method: 'wallet_addEthereumChain',
          params: [
            {
              chainId: targetChainIdHex,
              chainName: targetChain.name,
              nativeCurrency: targetChain.nativeCurrency,
              rpcUrls: [targetChain.rpcUrls.default.http[0]],
              blockExplorerUrls: [targetChain.blockExplorers?.default.url],
            },
          ],
        });
        return true;
      } catch {
        throw new Error(`No se pudo añadir la red ${targetChain.name}`);
      }
    }
    throw switchError;
  }
}

/**
 * Obtiene el cliente de wallet actual
 */
export function getWalletClient(): WalletClient | null {
  return walletClient;
}

/**
 * Crea un fetch wrapper con soporte para pagos x402
 * Este wrapper intercepta respuestas 402 y maneja el pago automáticamente
 */
export async function createPaymentFetch(): Promise<typeof fetch> {
  if (!walletClient) {
    throw new Error('Wallet not connected');
  }

  try {
    // Importar dinámicamente x402-fetch
    const { wrapFetchWithPayment } = await import('x402-fetch');

    // Crear el fetch wrapper con el wallet client
    // maxValue: máximo pago permitido en unidades base (1.5 USDC = 1500000)
    const maxPaymentValue = BigInt(1500000); // 1.5 USDC máximo

    return wrapFetchWithPayment(fetch, walletClient, maxPaymentValue);
  } catch (error) {
    console.error('Error creating payment fetch:', error);
    throw error;
  }
}

/**
 * Escucha cambios en la wallet
 */
export function onWalletChange(callback: (state: WalletState) => void): () => void {
  if (!hasWalletProvider()) {
    return () => {};
  }

  const handleAccountsChanged = async (accounts: string[]) => {
    if (accounts.length === 0) {
      callback({
        isConnected: false,
        address: null,
        chainId: null,
        balance: null,
      });
    } else {
      const state = await getWalletState();
      callback(state);
    }
  };

  const handleChainChanged = async () => {
    const state = await getWalletState();
    callback(state);
  };

  window.ethereum!.on('accountsChanged', handleAccountsChanged);
  window.ethereum!.on('chainChanged', handleChainChanged);

  // Retornar función para limpiar listeners
  return () => {
    window.ethereum!.removeListener('accountsChanged', handleAccountsChanged);
    window.ethereum!.removeListener('chainChanged', handleChainChanged);
  };
}

// Declaración de tipos para window.ethereum
declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
      on: (event: string, callback: (...args: unknown[]) => void) => void;
      removeListener: (event: string, callback: (...args: unknown[]) => void) => void;
    };
  }
}
