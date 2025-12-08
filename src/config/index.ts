// Configuración del frontend UltraPayx402

export const config = {
  // URL del backend - cambiar a localhost para desarrollo local
  apiUrl: import.meta.env.VITE_API_URL || 'http://localhost:3005',

  // Modo mock: usar datos simulados cuando el backend no está disponible
  // Cambiar a false para usar el backend real
  useMockData: import.meta.env.VITE_USE_MOCK === 'true',

  // Configuración x402
  x402: {
    facilitatorUrl: 'https://facilitator.ultravioletadao.xyz/',
    // Wallet que recibe los pagos
    walletAddress: '0x78420B020292C5c337Bb2dC5595c6cfD26C1eADb',
    // Red por defecto para testnet
    network: import.meta.env.VITE_X402_NETWORK || 'base-sepolia',
  },

  // Configuración de la app
  app: {
    name: 'UltraPayx402',
    currency: 'USDC', // Stablecoin para pagos
  }
};

export default config;
