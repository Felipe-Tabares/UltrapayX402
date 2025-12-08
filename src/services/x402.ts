/**
 * Servicio x402 para manejar pagos con el protocolo x402
 *
 * Este servicio utiliza viem para conectar con wallets y firma
 * las transacciones según el estándar x402.
 */

import { createWalletClient, custom, type WalletClient, toHex } from 'viem';
import { baseSepolia, base } from 'viem/chains';
import { config } from '../config';

// Interfaz para la información de pago del 402
export interface PaymentRequiredInfo {
  scheme: string;
  network: string;
  maxAmountRequired: string;
  resource: string;
  description: string;
  mimeType: string;
  payTo: string;
  maxTimeoutSeconds: number;
  asset: string;
  extra?: {
    name?: string;
    version?: string;
  };
}

// Payload de pago x402
export interface PaymentPayload {
  x402Version: number;
  scheme: string;
  network: string;
  payload: {
    signature: string;
    authorization: {
      from: string;
      to: string;
      value: string;
      validAfter: string;
      validBefore: string;
      nonce: string;
    };
  };
}

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

    const address = accounts[0] as `0x${string}`;

    // Crear wallet client con viem - IMPORTANTE: incluir account para x402-fetch
    walletClient = createWalletClient({
      account: address,
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
 * Detecta qué wallet está siendo usada
 */
function detectWalletType(): 'rabby' | 'metamask' | 'other' {
  if (!window.ethereum) return 'other';

  // Rabby se identifica con isRabby
  if ((window.ethereum as Record<string, unknown>).isRabby) return 'rabby';
  // MetaMask se identifica con isMetaMask
  if ((window.ethereum as Record<string, unknown>).isMetaMask) return 'metamask';

  return 'other';
}

/**
 * Abre el selector de cuentas para cambiar de dirección
 * Soporta MetaMask, Rabby y otras wallets
 */
export async function switchAccount(): Promise<WalletState> {
  if (!hasWalletProvider()) {
    throw new Error('No se encontró wallet. Instala MetaMask o Core Wallet.');
  }

  const walletType = detectWalletType();
  console.log('Detected wallet:', walletType);

  try {
    // Guardar la cuenta actual para comparar
    const currentAccounts = await window.ethereum!.request({
      method: 'eth_accounts',
    }) as string[];
    const currentAddress = currentAccounts[0];

    if (walletType === 'rabby') {
      // Rabby: usar wallet_requestPermissions pero con instrucciones claras
      // Rabby abrirá su popup interno para seleccionar cuenta
      try {
        await window.ethereum!.request({
          method: 'wallet_requestPermissions',
          params: [{ eth_accounts: {} }],
        });
      } catch {
        // Si Rabby no abre popup, lanzar error con instrucciones
        throw new Error('Haz clic en el icono de Rabby y selecciona otra cuenta');
      }
    } else {
      // MetaMask y otros: wallet_requestPermissions funciona bien
      await window.ethereum!.request({
        method: 'wallet_requestPermissions',
        params: [{ eth_accounts: {} }],
      });
    }

    // Obtener la nueva cuenta seleccionada
    const accounts = await window.ethereum!.request({
      method: 'eth_accounts',
    }) as string[];

    if (!accounts || accounts.length === 0) {
      throw new Error('No se seleccionó ninguna cuenta');
    }

    const address = accounts[0] as `0x${string}`;

    // Si la cuenta no cambió, dar instrucciones específicas
    if (address.toLowerCase() === currentAddress?.toLowerCase()) {
      if (walletType === 'rabby') {
        throw new Error('Cuenta sin cambios. Usa el icono de Rabby para cambiar.');
      }
      throw new Error('Selecciona una cuenta diferente en tu wallet');
    }

    // Actualizar wallet client con account para x402-fetch
    walletClient = createWalletClient({
      account: address,
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
    if (error instanceof Error) {
      if (error.message.includes('User rejected') || error.message.includes('user rejected')) {
        throw new Error('Solicitud cancelada');
      }
      throw error;
    }
    throw new Error('Error al cambiar de cuenta. Intenta desde tu wallet.');
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
 * Asegura que el walletClient esté inicializado con account
 * Si la wallet está conectada pero walletClient es null, lo inicializa
 */
async function ensureWalletClient(): Promise<WalletClient> {
  // Si no hay walletClient pero la wallet está conectada, inicializarlo
  if (!hasWalletProvider()) {
    throw new Error('No wallet provider found');
  }

  const accounts = await window.ethereum!.request({
    method: 'eth_accounts',
  }) as string[];

  if (!accounts || accounts.length === 0) {
    throw new Error('Wallet not connected');
  }

  const address = accounts[0] as `0x${string}`;

  // Siempre recrear walletClient con el account actual
  // Esto es necesario porque x402-fetch necesita acceder a walletClient.account.address
  walletClient = createWalletClient({
    account: address,
    chain: getChain(),
    transport: custom(window.ethereum!),
  });

  console.log('[x402] WalletClient initialized with account:', address);
  return walletClient;
}

/**
 * Interfaz para la respuesta 402 del backend x402-express
 */
interface X402Response {
  x402Version: number;
  error: string;
  accepts: PaymentRequiredInfo[];
}

/**
 * Genera un nonce aleatorio para la autorización
 */
function generateNonce(): string {
  const randomBytes = new Uint8Array(32);
  crypto.getRandomValues(randomBytes);
  return toHex(randomBytes);
}

/**
 * Firma una autorización de pago usando EIP-3009 (TransferWithAuthorization)
 * y retorna el payload x402 completo
 */
export async function signPaymentAuthorization(
  paymentInfo: PaymentRequiredInfo,
  amount: bigint
): Promise<PaymentPayload> {
  const client = await ensureWalletClient();

  if (!client.account) {
    throw new Error('Wallet account not available');
  }

  const address = client.account.address;
  const chain = getChain();

  // Verificar que la wallet esté en la red correcta antes de firmar
  const currentChainId = await window.ethereum!.request({
    method: 'eth_chainId',
  }) as string;
  const currentChainIdNum = parseInt(currentChainId, 16);

  if (currentChainIdNum !== chain.id) {
    console.log(`[x402] Switching network from ${currentChainIdNum} to ${chain.id} (${chain.name})`);
    await switchToCorrectNetwork();

    // Reinicializar walletClient con la nueva red
    walletClient = createWalletClient({
      account: address,
      chain: chain,
      transport: custom(window.ethereum!),
    });
    console.log('[x402] WalletClient reinitialized after network switch');
  }

  // Tiempos de validez
  const now = Math.floor(Date.now() / 1000);
  const validAfter = BigInt(now - 60); // Válido desde hace 1 minuto
  const validBefore = BigInt(now + paymentInfo.maxTimeoutSeconds + 300); // Válido por el timeout + 5 minutos extra

  // Generar nonce aleatorio
  const authorizationNonce = generateNonce();

  // USDC contract address en Base Sepolia o Base
  const usdcAddress = chain.id === 84532
    ? '0x036CbD53842c5426634e7929541eC2318f3dCF7e' // Base Sepolia USDC
    : '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913'; // Base USDC

  // EIP-712 Domain para USDC
  const domain = {
    name: paymentInfo.extra?.name || 'USD Coin',
    version: paymentInfo.extra?.version || '2',
    chainId: chain.id,
    verifyingContract: usdcAddress as `0x${string}`,
  };

  // Tipos EIP-712 para TransferWithAuthorization (EIP-3009)
  const types = {
    TransferWithAuthorization: [
      { name: 'from', type: 'address' },
      { name: 'to', type: 'address' },
      { name: 'value', type: 'uint256' },
      { name: 'validAfter', type: 'uint256' },
      { name: 'validBefore', type: 'uint256' },
      { name: 'nonce', type: 'bytes32' },
    ],
  };

  // Mensaje a firmar
  const message = {
    from: address,
    to: paymentInfo.payTo as `0x${string}`,
    value: amount,
    validAfter: validAfter,
    validBefore: validBefore,
    nonce: authorizationNonce as `0x${string}`,
  };

  console.log('[x402] Signing payment authorization:', {
    from: address,
    to: paymentInfo.payTo,
    amount: amount.toString(),
    validAfter: validAfter.toString(),
    validBefore: validBefore.toString(),
  });

  // Firmar con EIP-712 (usar walletClient que puede haber sido actualizado después del cambio de red)
  const signingClient = walletClient || client;
  const signature = await signingClient.signTypedData({
    account: signingClient.account!,
    domain,
    types,
    primaryType: 'TransferWithAuthorization',
    message,
  });

  // Construir el payload x402
  const paymentPayload: PaymentPayload = {
    x402Version: 1,
    scheme: paymentInfo.scheme,
    network: paymentInfo.network,
    payload: {
      signature: signature,
      authorization: {
        from: address,
        to: paymentInfo.payTo,
        value: amount.toString(),
        validAfter: validAfter.toString(),
        validBefore: validBefore.toString(),
        nonce: authorizationNonce,
      },
    },
  };

  return paymentPayload;
}

/**
 * Codifica el payload de pago para el header X-Payment
 */
export function encodePaymentHeader(payload: PaymentPayload): string {
  const jsonStr = JSON.stringify(payload);
  return btoa(jsonStr);
}

/**
 * Crea un fetch wrapper con soporte para pagos x402
 * Este wrapper intercepta respuestas 402 y maneja el pago automáticamente
 *
 * Flujo:
 * 1. Envía request sin pago
 * 2. Si recibe 402, lee el body JSON con la info de pago
 * 3. Abre wallet para que usuario firme la autorización
 * 4. Reenvía request con header X-Payment
 */
export async function createPaymentFetch(): Promise<typeof fetch> {
  // Asegurar que walletClient esté inicializado
  await ensureWalletClient();

  // Retornar un fetch wrapper que maneja 402 automáticamente
  return async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
    // Primera petición sin header de pago
    const firstResponse = await fetch(input, init);

    // Si no es 402, retornar la respuesta directamente
    if (firstResponse.status !== 402) {
      return firstResponse;
    }

    console.log('[x402] Received 402 Payment Required');

    // Leer la información de pago del body JSON (x402-express envía aquí los datos)
    let x402Data: X402Response;
    try {
      x402Data = await firstResponse.json();
    } catch (error) {
      console.error('[x402] Error parsing 402 response body:', error);
      throw new Error('No se pudo leer la información de pago del servidor');
    }

    // Validar que tengamos la info de pago
    if (!x402Data.accepts || x402Data.accepts.length === 0) {
      console.error('[x402] No payment info in 402 response:', x402Data);
      throw new Error('El servidor no proporcionó información de pago válida');
    }

    // Obtener la primera opción de pago (normalmente solo hay una)
    const paymentInfo = x402Data.accepts[0];

    console.log('[x402] Payment info:', {
      scheme: paymentInfo.scheme,
      network: paymentInfo.network,
      amount: paymentInfo.maxAmountRequired,
      payTo: paymentInfo.payTo,
      asset: paymentInfo.asset,
    });

    // Convertir el monto (ya viene en unidades atómicas, ej: 100000 = $0.10 USDC)
    const amount = BigInt(paymentInfo.maxAmountRequired);

    // Firmar la autorización de pago - esto abre la wallet para que el usuario confirme
    console.log('[x402] Requesting wallet signature...');
    const paymentPayload = await signPaymentAuthorization(paymentInfo, amount);

    // Codificar el payload para el header X-Payment
    const paymentHeader = encodePaymentHeader(paymentPayload);

    console.log('[x402] Payment signed, sending request with X-Payment header');

    // Segunda petición con el header X-Payment
    const newHeaders = new Headers(init?.headers);
    newHeaders.set('X-Payment', paymentHeader);

    const secondResponse = await fetch(input, {
      ...init,
      headers: newHeaders,
    });

    return secondResponse;
  };
}

/**
 * Escucha cambios en la wallet
 */
export function onWalletChange(callback: (state: WalletState) => void): () => void {
  if (!hasWalletProvider()) {
    return () => {};
  }

  const handleAccountsChanged = async (...args: unknown[]) => {
    const accounts = args[0] as string[];
    if (!accounts || accounts.length === 0) {
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
