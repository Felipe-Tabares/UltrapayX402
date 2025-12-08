/**
 * Hook de React para manejar pagos X402
 */

import { useState, useEffect, useCallback } from 'react';
import { paymentService, type PaymentState } from '../services/payment';

export function usePayment() {
  const [state, setState] = useState<PaymentState>(paymentService.getState());

  useEffect(() => {
    // Suscribirse a cambios en el estado
    const unsubscribe = paymentService.onStateChange(setState);
    return unsubscribe;
  }, []);

  const connectWallet = useCallback(async () => {
    try {
      await paymentService.connectWallet();
    } catch (error) {
      console.error('Error connecting wallet:', error);
      throw error;
    }
  }, []);

  const disconnectWallet = useCallback(async () => {
    try {
      await paymentService.disconnectWallet();
    } catch (error) {
      console.error('Error disconnecting wallet:', error);
      throw error;
    }
  }, []);

  const hasWallet = useCallback(() => {
    return paymentService.hasWallet();
  }, []);

  return {
    state,
    connectWallet,
    disconnectWallet,
    hasWallet,
    isConnected: state.isConnected,
    address: state.address,
    isProcessing: state.isProcessing,
    currentStep: state.currentStep,
    error: state.error,
  };
}
