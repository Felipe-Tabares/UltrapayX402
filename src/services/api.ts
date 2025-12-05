// Servicio API para conectar con el backend UltraPayx402
import { config } from '../config';

// Tipos
export interface Provider {
  id: string;
  name: string;
  type: 'image' | 'video';
  price: number;
  description: string;
  model: string;
}

export interface PricingInfo {
  currency: string;
  providers: Record<string, number>;
  byType: {
    image: {
      min: number;
      max: number;
      providers: Provider[];
    };
    video: {
      min: number;
      max: number;
      providers: Provider[];
    };
  };
}

export interface GenerateRequest {
  prompt: string;
  type: 'image' | 'video';
  provider?: string;
}

export interface GenerateResponse {
  success: boolean;
  transactionId: string;
  mediaUrl: string;
  type: 'image' | 'video';
  provider: string;
  providerName: string;
  price: number;
}

export interface PaymentRequiredResponse {
  error: string;
  price: number;
  currency: string;
  provider: string;
  providerName: string;
  x402: {
    'X-Payment-Required': string;
    'X-Payment-Amount': string;
    'X-Payment-Currency': string;
    'X-Payment-Recipient': string;
    'X-Facilitator-URL': string;
  };
}

export interface HealthResponse {
  status: string;
  service: string;
  timestamp: string;
}

// ============================================
// DATOS MOCK - Usar mientras el backend no esté desplegado
// Estos datos deben coincidir con la configuración del backend
// ============================================
const MOCK_PROVIDERS: Provider[] = [
  {
    id: 'nanobanana',
    name: 'NanoBanana',
    type: 'image',
    price: 0.10,
    description: 'Rapido y economico',
    model: 'nanobanana-v1'
  },
  {
    id: 'sd35',
    name: 'SD3.5',
    type: 'image',
    price: 0.15,
    description: 'Alta calidad, versatil',
    model: 'stable-diffusion-3.5'
  },
  {
    id: 'midjourney',
    name: 'Midjourney',
    type: 'image',
    price: 0.20,
    description: 'Artistico premium',
    model: 'mj-v6'
  },
  {
    id: 'veo3',
    name: 'Veo 3',
    type: 'video',
    price: 0.85,
    description: 'Videos realistas',
    model: 'veo-3'
  },
  {
    id: 'runway',
    name: 'Runway Gen-3',
    type: 'video',
    price: 1.20,
    description: 'Cinematografico',
    model: 'gen-3'
  }
];

const MOCK_IMAGE_URLS = [
  'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800',
  'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800',
  'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
  'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=800',
  'https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=800',
  'https://images.unsplash.com/photo-1505142468610-359e7d316be0?w=800',
  'https://images.unsplash.com/photo-1557672172-298e090bd0f1?w=800',
];

// ============================================
// Cliente API
// ============================================
class ApiService {
  private baseUrl: string;
  private useMock: boolean;

  constructor() {
    this.baseUrl = config.apiUrl;
    this.useMock = config.useMockData;
  }

  // Helper para hacer requests
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;

    const defaultHeaders: HeadersInit = {
      'Content-Type': 'application/json',
    };

    const response = await fetch(url, {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    });

    // Si es 402, retornar la respuesta para que el caller la maneje
    if (response.status === 402) {
      const data = await response.json();
      throw new PaymentRequiredError(data);
    }

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Error desconocido' }));
      throw new ApiError(response.status, error.message || error.error);
    }

    return response.json();
  }

  // Health check
  async health(): Promise<HealthResponse> {
    if (this.useMock) {
      return {
        status: 'ok',
        service: 'ultrapay-backend (mock)',
        timestamp: new Date().toISOString()
      };
    }
    return this.request<HealthResponse>('/health');
  }

  // Obtener proveedores disponibles
  async getProviders(): Promise<{ providers: Provider[] }> {
    if (this.useMock) {
      // Simular delay de red
      await new Promise(resolve => setTimeout(resolve, 300));
      return { providers: MOCK_PROVIDERS };
    }
    return this.request<{ providers: Provider[] }>('/providers');
  }

  // Obtener precios
  async getPricing(): Promise<PricingInfo> {
    if (this.useMock) {
      const imageProviders = MOCK_PROVIDERS.filter(p => p.type === 'image');
      const videoProviders = MOCK_PROVIDERS.filter(p => p.type === 'video');

      return {
        currency: 'USD',
        providers: MOCK_PROVIDERS.reduce((acc, p) => {
          acc[p.id] = p.price;
          return acc;
        }, {} as Record<string, number>),
        byType: {
          image: {
            min: Math.min(...imageProviders.map(p => p.price)),
            max: Math.max(...imageProviders.map(p => p.price)),
            providers: imageProviders
          },
          video: {
            min: Math.min(...videoProviders.map(p => p.price)),
            max: Math.max(...videoProviders.map(p => p.price)),
            providers: videoProviders
          }
        }
      };
    }
    return this.request<PricingInfo>('/pricing');
  }

  // Generar contenido
  async generate(data: GenerateRequest, paymentToken?: string): Promise<GenerateResponse> {
    if (this.useMock) {
      // Simular delay de generacion
      await new Promise(resolve => setTimeout(resolve, 2000));

      const provider = MOCK_PROVIDERS.find(p => p.id === data.provider) || MOCK_PROVIDERS[0];

      // Si no hay token de pago, simular respuesta 402
      if (!paymentToken) {
        throw new PaymentRequiredError({
          error: 'Payment required',
          price: provider.price,
          currency: 'USD',
          provider: provider.id,
          providerName: provider.name,
          x402: {
            'X-Payment-Required': 'true',
            'X-Payment-Amount': provider.price.toString(),
            'X-Payment-Currency': 'USD',
            'X-Payment-Recipient': config.x402.walletAddress,
            'X-Facilitator-URL': config.x402.facilitatorUrl
          }
        });
      }

      // Simular generacion exitosa
      return {
        success: true,
        transactionId: `mock-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        mediaUrl: MOCK_IMAGE_URLS[Math.floor(Math.random() * MOCK_IMAGE_URLS.length)],
        type: data.type,
        provider: provider.id,
        providerName: provider.name,
        price: provider.price
      };
    }

    // Request real al backend
    const headers: HeadersInit = {};

    if (paymentToken) {
      headers['X-Payment'] = paymentToken;
    }

    return this.request<GenerateResponse>('/generate', {
      method: 'POST',
      headers,
      body: JSON.stringify(data),
    });
  }

  // Metodo para cambiar entre mock y real
  setUseMock(useMock: boolean) {
    this.useMock = useMock;
  }

  // Verificar si esta en modo mock
  isUsingMock(): boolean {
    return this.useMock;
  }

  /**
   * Genera contenido usando x402-fetch con pago automatico
   * Este metodo usa el wallet client para firmar pagos automaticamente
   */
  async generateWithPayment(
    data: GenerateRequest,
    paymentFetch: typeof fetch
  ): Promise<GenerateResponse> {
    if (this.useMock) {
      // En modo mock, simular el pago y generacion
      await new Promise(resolve => setTimeout(resolve, 2000));

      const provider = MOCK_PROVIDERS.find(p => p.id === data.provider) || MOCK_PROVIDERS[0];

      return {
        success: true,
        transactionId: `mock-paid-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        mediaUrl: MOCK_IMAGE_URLS[Math.floor(Math.random() * MOCK_IMAGE_URLS.length)],
        type: data.type,
        provider: provider.id,
        providerName: provider.name,
        price: provider.price
      };
    }

    // Request real con x402-fetch que maneja el pago automaticamente
    const url = `${this.baseUrl}/generate`;

    const response = await paymentFetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Error desconocido' }));
      throw new ApiError(response.status, error.message || error.error);
    }

    return response.json();
  }
}

// Error personalizado para 402 Payment Required
export class PaymentRequiredError extends Error {
  public paymentInfo: PaymentRequiredResponse;

  constructor(paymentInfo: PaymentRequiredResponse) {
    super('Payment required');
    this.name = 'PaymentRequiredError';
    this.paymentInfo = paymentInfo;
  }
}

// Error generico de API
export class ApiError extends Error {
  public status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

// Instancia singleton
export const api = new ApiService();

export default api;
