/**
 * Servicio de pagos X402
 * Maneja la conexión de wallet, firma de pagos y ejecución del protocolo X402
 */

import { ethers, BrowserProvider, type Signer } from 'ethers';
import { getNetworkInfoByString, isNetworkSupported, type NetworkInfo } from './network';

export interface X402PaymentInfo {
  x402Version: number;
  error: string;
  accepts: Array<{
    scheme: string;
    network: string;
    maxAmountRequired: string;
    resource: string;
    description?: string;
    mimeType?: string;
    payTo: string;
    maxTimeoutSeconds: number;
    asset: string;
    outputSchema?: any;
    extra?: {
      name?: string;
      version?: string;
    };
  }>;
}

export interface PaymentState {
  isConnected: boolean;
  address: string | null;
  isProcessing: boolean;
  currentStep: 'idle' | 'connecting' | 'switching_network' | 'executing' | 'confirming' | 'completed' | 'error';
  error: string | null;
}

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

class PaymentService {
  private provider: any = null;
  private ethersProvider: BrowserProvider | null = null;
  private signer: Signer | null = null;
  private state: PaymentState = {
    isConnected: false,
    address: null,
    isProcessing: false,
    currentStep: 'idle',
    error: null
  };
  private stateListeners: Array<(state: PaymentState) => void> = [];

  constructor() {
    this.checkForWallet();
  }

  /**
   * Verifica si hay una wallet instalada
   */
  private checkForWallet() {
    if (typeof window !== 'undefined' && (window as any).ethereum) {
      this.provider = (window as any).ethereum;
      this.ethersProvider = new BrowserProvider(this.provider);
      this.setupWalletListeners();
    }
  }

  /**
   * Configura listeners para eventos de la wallet
   */
  private setupWalletListeners() {
    if (!this.provider) return;

    this.provider.on('accountsChanged', (accounts: string[]) => {
      if (accounts.length > 0) {
        this.updateState({
          isConnected: true,
          address: accounts[0]
        });
      } else {
        this.disconnectWallet();
      }
    });

    this.provider.on('chainChanged', (_chainId: string) => {
      // Recargar la página cuando cambia la red para evitar inconsistencias
      window.location.reload();
    });
  }

  /**
   * Conecta la wallet del usuario
   */
  async connectWallet(): Promise<void> {
    if (!this.provider) {
      throw new Error('No se encontró MetaMask. Por favor instala MetaMask.');
    }

    try {
      this.updateState({ currentStep: 'connecting', isProcessing: true });

      // Solicitar cuentas de MetaMask
      const accounts = await this.provider.request({ method: 'eth_requestAccounts' });

      if (accounts.length > 0) {
        this.signer = await this.ethersProvider!.getSigner();
        this.updateState({
          isConnected: true,
          address: accounts[0],
          isProcessing: false,
          currentStep: 'idle'
        });
      }
    } catch (error: any) {
      console.error('❌ Error conectando wallet:', error);
      this.updateState({
        isProcessing: false,
        currentStep: 'error',
        error: error.message || 'Failed to connect wallet'
      });
      throw error;
    }
  }

  /**
   * Desconecta la wallet
   */
  async disconnectWallet(): Promise<void> {
    this.signer = null;
    this.updateState({
      isConnected: false,
      address: null,
      currentStep: 'idle',
      error: null
    });
  }

  /**
   * Obtiene el estado actual de la wallet
   */
  getState(): PaymentState {
    return { ...this.state };
  }

  /**
   * Suscribe a cambios en el estado
   */
  onStateChange(listener: (state: PaymentState) => void): () => void {
    this.stateListeners.push(listener);
    return () => {
      this.stateListeners = this.stateListeners.filter(l => l !== listener);
    };
  }

  /**
   * Actualiza el estado y notifica a los listeners
   */
  private updateState(update: Partial<PaymentState>) {
    this.state = {
      ...this.state,
      ...update
    };
    this.stateListeners.forEach(listener => listener(this.state));
  }

  /**
   * Cambia a la red requerida
   */
  private async switchToNetwork(networkInfo: NetworkInfo): Promise<void> {
    if (!this.provider) return;

    try {
      await this.provider.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: networkInfo.chainIdHex }],
      });
    } catch (error: any) {
      // Si la red no existe, agregarla
      if (error.code === 4902) {
        await this.addNetwork(networkInfo);
      } else {
        throw error;
      }
    }
  }

  /**
   * Agrega una nueva red a la wallet
   */
  private async addNetwork(networkInfo: NetworkInfo): Promise<void> {
    if (!this.provider) return;

    await this.provider.request({
      method: 'wallet_addEthereumChain',
      params: [{
        chainId: networkInfo.chainIdHex,
        chainName: networkInfo.name,
        nativeCurrency: networkInfo.nativeCurrency,
        rpcUrls: [networkInfo.rpcUrl],
        blockExplorerUrls: [networkInfo.explorer],
      }],
    });
  }

  /**
   * Ejecuta el pago según el protocolo X402
   * Retorna el payload de pago en formato base64
   */
  async executePayment(paymentInfo: X402PaymentInfo): Promise<string> {
    if (!this.signer || !this.provider) {
      throw new Error('Wallet no conectada');
    }

    if (!paymentInfo.accepts || paymentInfo.accepts.length === 0) {
      throw new Error('No hay métodos de pago disponibles');
    }

    try {
      this.updateState({ isProcessing: true, currentStep: 'switching_network' });

      // Usar el primer método de pago aceptado
      const accept = paymentInfo.accepts[0];

      // Verificar que el network esté soportado
      if (!isNetworkSupported(accept.network)) {
        throw new Error(
          `Network no soportado: ${accept.network}`
        );
      }

      // Obtener información de la red
      const networkInfo = getNetworkInfoByString(accept.network);
      if (!networkInfo) {
        throw new Error(`No se pudo obtener información de la red: ${accept.network}`);
      }

      // Cambiar a la red requerida
      await this.switchToNetwork(networkInfo);

      this.updateState({ currentStep: 'executing' });

      // Crear contrato del token (USDC)
      const tokenContract = new ethers.Contract(
        accept.asset,
        [
          'function balanceOf(address account) view returns (uint256)',
          'function nonces(address owner) view returns (uint256)',
          'function DOMAIN_SEPARATOR() view returns (bytes32)'
        ],
        this.signer
      );

      // El monto ya viene en wei desde la API
      const amount = BigInt(accept.maxAmountRequired);

      // Obtener dirección del usuario
      const address = await this.signer.getAddress();

      // Verificar balance
      try {
        const balance = await tokenContract.balanceOf(address);
        if (balance < amount) {
          throw new Error(
            `Saldo insuficiente. Tienes ${(Number(balance) / 1e6).toFixed(6)} USDC, necesitas ${(Number(amount) / 1e6).toFixed(6)} USDC en ${networkInfo.name}`
          );
        }
      } catch (error: any) {
        if (error.message?.includes('could not decode result data') || error.message?.includes('BAD_DATA')) {
          throw new Error(
            `No se pudo verificar el balance. Asegúrate de estar conectado a la red ${networkInfo.name} (${accept.network}) y que el contrato ${accept.asset} exista en esa red.`
          );
        }
        throw error;
      }

      // Generar datos para la firma EIP-3009
      const validAfter = Math.floor(Date.now() / 1000);
      const validBefore = validAfter + (accept.maxTimeoutSeconds || 600);

      // Generar nonce aleatorio para la autorización
      const authorizationNonce = ethers.hexlify(ethers.randomBytes(32));

      // Domain separator para el token
      const tokenName = accept.extra?.name || 'USD Coin';
      const tokenVersion = accept.extra?.version || '2';

      const domain = {
        name: tokenName,
        version: tokenVersion,
        chainId: networkInfo.chainId,
        verifyingContract: accept.asset
      };

      // Tipos para EIP-3009 TransferWithAuthorization
      const types = {
        TransferWithAuthorization: [
          { name: 'from', type: 'address' },
          { name: 'to', type: 'address' },
          { name: 'value', type: 'uint256' },
          { name: 'validAfter', type: 'uint256' },
          { name: 'validBefore', type: 'uint256' },
          { name: 'nonce', type: 'bytes32' }
        ]
      };

      const value = {
        from: address,
        to: accept.payTo,
        value: amount.toString(),
        validAfter: validAfter.toString(),
        validBefore: validBefore.toString(),
        nonce: authorizationNonce
      };

      this.updateState({ currentStep: 'confirming' });

      // Firmar el permit usando EIP-712
      const signature = await this.signer.signTypedData(domain, types, value);

      // Verificar que la firma sea válida localmente
      const recoveredAddress = ethers.verifyTypedData(domain, types, value, signature);

      if (recoveredAddress.toLowerCase() !== address.toLowerCase()) {
        throw new Error('La firma no es válida - las direcciones no coinciden');
      }

      this.updateState({
        isProcessing: false,
        currentStep: 'completed',
        error: null
      });

      // Crear el payload en formato x402
      const paymentPayload: PaymentPayload = {
        x402Version: 1,
        scheme: accept.scheme,
        network: accept.network,
        payload: {
          signature: signature,
          authorization: {
            from: address,
            to: accept.payTo,
            value: amount.toString(),
            validAfter: validAfter.toString(),
            validBefore: validBefore.toString(),
            nonce: authorizationNonce
          }
        }
      };

  
      const paymentPayloadJson = JSON.stringify(paymentPayload); 
      const paymentPayloadBase64 = btoa(paymentPayloadJson);
 
  
      return paymentPayloadBase64;
    } catch (error: any) {
      this.updateState({
        isProcessing: false,
        currentStep: 'error',
        error: error.message || 'Payment failed'
      });
      throw error;
    }
  }

  /**
   * Verifica si hay una wallet disponible
   */
  hasWallet(): boolean {
    return this.provider !== null;
  }

  /**
   * Verifica si la wallet está conectada
   */
  isConnected(): boolean {
    return this.state.isConnected;
  }
}

// Instancia singleton
export const paymentService = new PaymentService();
