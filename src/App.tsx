import { useState, useEffect } from 'react';
import { Landing } from './components/Landing';
import { Dashboard } from './components/Dashboard';
import { Generate } from './components/Generate';
import { Result } from './components/Result';
import { History } from './components/History';
import { Settings } from './components/Settings';
import {
  connectWallet,
  disconnectWallet,
  getWalletState,
  hasWalletProvider,
  onWalletChange,
  type WalletState
} from './services/x402';

export type View = 'landing' | 'dashboard' | 'generate' | 'result' | 'history' | 'settings';

export interface GeneratedContent {
  id: string;
  prompt: string;
  type: 'image' | 'video';
  model: string;
  date: string;
  cost: number;
  url: string;
}

function App() {
  const [currentView, setCurrentView] = useState<View>('landing');
  const [walletState, setWalletState] = useState<WalletState>({
    isConnected: false,
    address: null,
    chainId: null,
    balance: null,
  });
  const [isConnectingWallet, setIsConnectingWallet] = useState(false);
  const [walletError, setWalletError] = useState<string | null>(null);
  const [currentResult, setCurrentResult] = useState<GeneratedContent | null>(null);

  // Escuchar cambios en la wallet (pero NO auto-conectar al cargar)
  useEffect(() => {
    // Escuchar cambios en la wallet mientras está conectada
    const cleanup = onWalletChange((newState) => {
      setWalletState(newState);
      // Si se desconecta desde la wallet, volver al landing
      if (!newState.isConnected && currentView !== 'landing') {
        setCurrentView('landing');
      }
    });

    return cleanup;
  }, [currentView]);

  // Escuchar el boton de atras/adelante del navegador
  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      if (event.state?.view) {
        setCurrentView(event.state.view);
      }
    };

    window.addEventListener('popstate', handlePopState);
    window.history.replaceState({ view: 'landing' }, '', '/');

    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Historia de generaciones (empieza vacia, se llena con uso real)
  const [history, setHistory] = useState<GeneratedContent[]>([]);

  // Conectar wallet real
  const handleConnectWallet = async () => {
    if (!hasWalletProvider()) {
      setWalletError('No se encontro wallet. Instala MetaMask o Core Wallet.');
      return;
    }

    setIsConnectingWallet(true);
    setWalletError(null);

    try {
      const state = await connectWallet();
      setWalletState(state);
      setCurrentView('dashboard');
      window.history.pushState({ view: 'dashboard' }, '', '/dashboard');
    } catch (error) {
      console.error('Error connecting wallet:', error);
      setWalletError(error instanceof Error ? error.message : 'Error al conectar wallet');
    } finally {
      setIsConnectingWallet(false);
    }
  };

  const handleDisconnectWallet = async () => {
    await disconnectWallet();
    setWalletState({
      isConnected: false,
      address: null,
      chainId: null,
      balance: null,
    });
    setCurrentView('landing');
    window.history.pushState({ view: 'landing' }, '', '/');
  };

  const navigateTo = (view: View) => {
    if (view !== currentView) {
      setCurrentView(view);
      window.history.pushState({ view }, '', `/${view === 'landing' ? '' : view}`);
    }
  };

  const handleGenerate = (content: Omit<GeneratedContent, 'id' | 'date'>) => {
    const newContent: GeneratedContent = {
      ...content,
      id: Date.now().toString(),
      date: new Date().toISOString().split('T')[0],
    };
    setHistory([newContent, ...history]);
    setCurrentResult(newContent);
    navigateTo('result');
  };

  return (
    <div className="min-h-screen bg-white">
      {currentView === 'landing' && (
        <Landing
          onConnectWallet={handleConnectWallet}
          isConnecting={isConnectingWallet}
          error={walletError}
        />
      )}
      {currentView === 'dashboard' && (
        <Dashboard
          onNavigate={navigateTo}
          history={history.slice(0, 5)}
          onDisconnect={handleDisconnectWallet}
          walletAddress={walletState.address}
          onWalletChange={setWalletState}
        />
      )}
      {currentView === 'generate' && (
        <Generate
          onNavigate={navigateTo}
          onGenerate={handleGenerate}
          onDisconnect={handleDisconnectWallet}
          onWalletChange={setWalletState}
        />
      )}
      {currentView === 'result' && currentResult && (
        <Result
          content={currentResult}
          onNavigate={navigateTo}
          onRegenerate={() => navigateTo('generate')}
          onDisconnect={handleDisconnectWallet}
          walletAddress={walletState.address}
          onWalletChange={setWalletState}
        />
      )}
      {currentView === 'history' && (
        <History
          history={history}
          onNavigate={navigateTo}
          onDisconnect={handleDisconnectWallet}
          walletAddress={walletState.address}
          onWalletChange={setWalletState}
        />
      )}
      {currentView === 'settings' && (
        <Settings
          isWalletConnected={walletState.isConnected}
          onNavigate={navigateTo}
          onDisconnectWallet={handleDisconnectWallet}
          walletAddress={walletState.address}
          onWalletChange={setWalletState}
        />
      )}
    </div>
  );
}

export default App;
