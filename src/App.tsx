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

// Obtener la vista inicial desde la URL
function getInitialView(): View {
  const path = window.location.pathname.replace('/', '');
  const validViews: View[] = ['landing', 'dashboard', 'generate', 'result', 'history', 'settings'];
  if (path && validViews.includes(path as View)) {
    return path as View;
  }
  return 'landing';
}

function App() {
  const [currentView, setCurrentView] = useState<View>(getInitialView);
  const [walletState, setWalletState] = useState<WalletState>({
    isConnected: false,
    address: null,
    chainId: null,
    balance: null,
  });
  const [isConnectingWallet, setIsConnectingWallet] = useState(false);
  const [walletError, setWalletError] = useState<string | null>(null);
  const [currentResult, setCurrentResult] = useState<GeneratedContent | null>(null);

  // Verificar si ya hay una wallet conectada al cargar la página
  useEffect(() => {
    async function checkExistingConnection() {
      if (hasWalletProvider()) {
        const state = await getWalletState();
        if (state.isConnected && state.address) {
          // Solo restaurar el estado de la wallet, sin cambiar de vista
          setWalletState(state);
        }
      }
    }
    checkExistingConnection();
  }, []); // Solo al montar

  // Escuchar cambios en la wallet
  useEffect(() => {
    const cleanup = onWalletChange((newState) => {
      setWalletState(newState);
      // Si se desconecta desde la wallet, volver al landing
      if (!newState.isConnected && currentView !== 'landing') {
        setCurrentView('landing');
        window.history.pushState({ view: 'landing' }, '', '/');
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
    // Guardar el estado actual en el historial (sin cambiar la URL)
    const initialView = getInitialView();
    window.history.replaceState({ view: initialView }, '', initialView === 'landing' ? '/' : `/${initialView}`);

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
          onGoToDashboard={() => navigateTo('dashboard')}
          onDisconnect={handleDisconnectWallet}
          isConnecting={isConnectingWallet}
          isConnected={walletState.isConnected}
          walletAddress={walletState.address}
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
