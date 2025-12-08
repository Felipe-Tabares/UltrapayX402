// Configuración del frontend UltraPayx402

export const config = {
  // URL del backend en Render
  apiUrl: import.meta.env.VITE_API_URL || 'https://ultrapayx402-backend.onrender.com',

  // Modo mock: usar datos simulados cuando el backend no está disponible
  // Cambiar a false para usar el backend real
  useMockData: import.meta.env.VITE_USE_MOCK === 'true',

  // Configuración x402
  x402: {
    facilitatorUrl: 'https://facilitator.ultravioletadao.xyz/',
    // Testnet wallet
    walletAddress: '0x34033041a5944B8F10f8E4D8496Bfb84f1A293A8',
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
