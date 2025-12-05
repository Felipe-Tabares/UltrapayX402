// Configuración del frontend UltraPayx402

export const config = {
  // URL del backend - cambiar en producción
  // Cuando despliegues a Lambda, actualiza VITE_API_URL en .env
  apiUrl: import.meta.env.VITE_API_URL || 'http://localhost:3000',

  // Modo mock: usar datos simulados cuando el backend no está disponible
  // Cambiar a false cuando el backend esté desplegado
  useMockData: import.meta.env.VITE_USE_MOCK === 'true' || true,

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
