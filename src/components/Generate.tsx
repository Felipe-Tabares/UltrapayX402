import { useState, useEffect } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Label } from './ui/label';
import { Loader2, Sparkles, Wand2, Image, Video, Zap, CheckCircle2, AlertCircle, Wallet } from 'lucide-react';
import type { View, GeneratedContent } from '../App';
import { api, type Provider } from '../services/api';
import {
  connectWallet,
  getWalletState,
  hasWalletProvider,
  createPaymentFetch,
  switchToCorrectNetwork,
  type WalletState
} from '../services/x402';
import { config } from '../config';

interface GenerateProps {
  onNavigate: (view: View) => void;
  onGenerate: (content: Omit<GeneratedContent, 'id' | 'date'>) => void;
  onDisconnect: () => void;
  onWalletChange?: (state: WalletState) => void;
}

const resolutions = ['512x512', '1024x1024', '1920x1080', '2048x2048'];
const durations = ['5s', '10s', '15s', '30s'];
const styles = ['Realista', 'Artistico', 'Anime', 'Abstracto', '3D Render', 'Cinematico'];

export function Generate({ onNavigate, onGenerate, onDisconnect, onWalletChange }: GenerateProps) {
  const [prompt, setPrompt] = useState('');
  const [selectedModel, setSelectedModel] = useState('');
  const [resolution, setResolution] = useState('1024x1024');
  const [duration, setDuration] = useState('10s');
  const [style, setStyle] = useState('Realista');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generationStep, setGenerationStep] = useState<string>('');

  // Estado para proveedores cargados desde el backend
  const [providers, setProviders] = useState<Provider[]>([]);
  const [isLoadingProviders, setIsLoadingProviders] = useState(true);

  // Estado de la wallet para x402
  const [walletState, setWalletState] = useState<WalletState>({
    isConnected: false,
    address: null,
    chainId: null,
    balance: null,
  });
  const [isConnectingWallet, setIsConnectingWallet] = useState(false);

  // Cargar proveedores y estado de wallet al montar
  useEffect(() => {
    async function init() {
      // Cargar proveedores
      try {
        setIsLoadingProviders(true);
        const response = await api.getProviders();
        setProviders(response.providers);

        if (response.providers.length > 0) {
          setSelectedModel(response.providers[0].id);
        }
      } catch (err) {
        console.error('Error loading providers:', err);
        setError('No se pudieron cargar los modelos. Verifica la conexion con el servidor.');
      } finally {
        setIsLoadingProviders(false);
      }

      // Verificar estado de wallet
      if (hasWalletProvider()) {
        const state = await getWalletState();
        setWalletState(state);
      }
    }

    init();
  }, []);

  const currentModel = providers.find(m => m.id === selectedModel);
  const estimatedCost = currentModel?.price || 0;

  // En modo mock no requerimos wallet conectada
  const isUsingMock = api.isUsingMock();
  const canGenerate = prompt.trim().length > 0 &&
    !isLoadingProviders &&
    (isUsingMock || walletState.isConnected);

  // Conectar wallet
  const handleConnectWallet = async () => {
    setIsConnectingWallet(true);
    setError(null);

    try {
      const state = await connectWallet();
      setWalletState(state);

      // Verificar si estamos en la red correcta
      const expectedChainId = config.x402.network === 'base-sepolia' ? 84532 : 8453;
      if (state.chainId !== expectedChainId) {
        setError(`Por favor cambia a la red ${config.x402.network}`);
        await switchToCorrectNetwork();
        const newState = await getWalletState();
        setWalletState(newState);
      }
    } catch (err) {
      console.error('Error connecting wallet:', err);
      setError(err instanceof Error ? err.message : 'Error al conectar wallet');
    } finally {
      setIsConnectingWallet(false);
    }
  };

  // Generar contenido con pago x402
  const handleGenerate = async () => {
    if (!prompt.trim() || !currentModel) return;

    setIsGenerating(true);
    setError(null);
    setGenerationStep('Preparando...');

    try {
      let result;

      if (isUsingMock) {
        // Modo mock: simular pago y generacion
        setGenerationStep('Simulando pago x402...');
        await new Promise(resolve => setTimeout(resolve, 1000));

        setGenerationStep('Generando con IA...');
        result = await api.generateWithPayment(
          {
            prompt,
            type: currentModel.type,
            provider: currentModel.id
          },
          fetch // En mock no se usa realmente
        );
      } else {
        // Modo real: usar x402-fetch con pago automatico
        if (!walletState.isConnected) {
          throw new Error('Wallet no conectada');
        }

        setGenerationStep('Preparando pago x402...');
        const paymentFetch = await createPaymentFetch();

        setGenerationStep('Firmando transaccion...');
        // x402-fetch manejara automaticamente el 402 y el pago

        setGenerationStep('Generando con IA...');
        result = await api.generateWithPayment(
          {
            prompt,
            type: currentModel.type,
            provider: currentModel.id
          },
          paymentFetch
        );
      }

      setGenerationStep('Completado!');

      // Notificar resultado
      onGenerate({
        prompt,
        type: currentModel.type,
        model: currentModel.name,
        cost: estimatedCost,
        url: result.mediaUrl,
      });

    } catch (err) {
      console.error('Generate error:', err);
      setError(err instanceof Error ? err.message : 'Error al generar contenido');
    } finally {
      setIsGenerating(false);
      setGenerationStep('');
    }
  };

  const promptSuggestions = [
    'Un paisaje futurista con montanas flotantes',
    'Retrato de un astronauta en Marte',
    'Ciudad cyberpunk con luces neon',
    'Bosque magico con criaturas fantasticas',
  ];

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar currentView="generate" onNavigate={onNavigate} onDisconnect={onDisconnect} />

      <div className="flex-1">
        <Header walletAddress={walletState.address} onNavigate={onNavigate} onWalletChange={(state) => {
          setWalletState(state);
          if (onWalletChange) onWalletChange(state);
        }} />

        <main className="p-6 lg:p-8">
          <div className="max-w-5xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-2">
                <div className="size-10 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <Wand2 className="size-5 text-white" />
                </div>
                <h1 className="text-2xl lg:text-3xl font-bold">Crear contenido</h1>
              </div>
              <p className="text-muted-foreground">Describe tu vision y deja que la IA la haga realidad</p>
            </div>

            {/* Wallet Status Banner */}
            {!isUsingMock && (
              <Card className={`p-4 mb-6 ${walletState.isConnected ? 'border-green-500/50 bg-green-500/10' : 'border-yellow-500/50 bg-yellow-500/10'}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Wallet className={`size-5 ${walletState.isConnected ? 'text-green-600' : 'text-yellow-600'}`} />
                    {walletState.isConnected ? (
                      <div>
                        <p className="text-sm font-medium text-green-700">Wallet conectada</p>
                        <p className="text-xs text-muted-foreground">
                          {walletState.address?.slice(0, 6)}...{walletState.address?.slice(-4)}
                          {' | '}Red: {walletState.chainId === 84532 ? 'Base Sepolia' : walletState.chainId === 8453 ? 'Base' : `Chain ${walletState.chainId}`}
                        </p>
                      </div>
                    ) : (
                      <div>
                        <p className="text-sm font-medium text-yellow-700">Wallet no conectada</p>
                        <p className="text-xs text-muted-foreground">Conecta tu wallet para realizar pagos x402</p>
                      </div>
                    )}
                  </div>
                  {!walletState.isConnected && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleConnectWallet}
                      disabled={isConnectingWallet}
                    >
                      {isConnectingWallet ? (
                        <Loader2 className="size-4 animate-spin mr-2" />
                      ) : (
                        <Wallet className="size-4 mr-2" />
                      )}
                      Conectar Wallet
                    </Button>
                  )}
                </div>
              </Card>
            )}

            {/* Mock Mode Banner */}
            {isUsingMock && (
              <Card className="p-4 mb-6 border-blue-500/50 bg-blue-500/10">
                <div className="flex items-center gap-2 text-blue-700">
                  <AlertCircle className="size-5" />
                  <p className="text-sm">
                    <strong>Modo Demo:</strong> Los pagos y generaciones son simulados.
                    Configura VITE_USE_MOCK=false cuando el backend esté desplegado.
                  </p>
                </div>
              </Card>
            )}

            {/* Error message */}
            {error && (
              <Card className="p-4 mb-6 border-destructive/50 bg-destructive/10">
                <div className="flex items-center gap-2 text-destructive">
                  <AlertCircle className="size-5" />
                  <p className="text-sm">{error}</p>
                </div>
              </Card>
            )}

            <div className="grid lg:grid-cols-3 gap-6">
              {/* Main Form */}
              <div className="lg:col-span-2 space-y-6">
                {/* Prompt Card */}
                <Card className="p-6 border-border/50">
                  <Label htmlFor="prompt" className="text-base font-semibold mb-3 block">
                    Describe lo que quieres crear
                  </Label>
                  <Textarea
                    id="prompt"
                    placeholder="Ej: Un paisaje futurista con montanas flotantes, cielo purpura, estilo cinematico..."
                    className="min-h-32 resize-none text-base border-border/50 focus:border-primary/50 transition-colors"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                  />

                  {/* Prompt suggestions */}
                  <div className="mt-4">
                    <p className="text-xs text-muted-foreground mb-2">Sugerencias rapidas:</p>
                    <div className="flex flex-wrap gap-2">
                      {promptSuggestions.map((suggestion, index) => (
                        <button
                          key={index}
                          onClick={() => setPrompt(suggestion)}
                          className="text-xs px-3 py-1.5 bg-secondary/50 hover:bg-secondary text-muted-foreground hover:text-foreground rounded-full transition-colors"
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  </div>
                </Card>

                {/* Model Selection */}
                <Card className="p-6 border-border/50">
                  <Label className="text-base font-semibold mb-4 block">Modelo de IA</Label>

                  {isLoadingProviders ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="size-6 animate-spin text-primary" />
                      <span className="ml-2 text-muted-foreground">Cargando modelos...</span>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                      {providers.map((model) => {
                        const isSelected = selectedModel === model.id;
                        const Icon = model.type === 'image' ? Image : Video;

                        return (
                          <button
                            key={model.id}
                            onClick={() => setSelectedModel(model.id)}
                            className={`relative p-4 rounded-xl border-2 text-left transition-all duration-200 ${
                              isSelected
                                ? 'border-primary bg-primary/5 shadow-lg shadow-primary/10'
                                : 'border-border/50 hover:border-primary/30 hover:bg-secondary/30'
                            }`}
                          >
                            {isSelected && (
                              <CheckCircle2 className="absolute top-2 right-2 size-5 text-primary" />
                            )}
                            <div className={`size-8 rounded-lg flex items-center justify-center mb-2 ${
                              model.type === 'image'
                                ? 'bg-blue-500/10 text-blue-600'
                                : 'bg-pink-500/10 text-pink-600'
                            }`}>
                              <Icon className="size-4" />
                            </div>
                            <p className="font-semibold text-sm">{model.name}</p>
                            <p className="text-xs text-muted-foreground">{model.description}</p>
                            <p className="text-xs font-semibold text-primary mt-1">${model.price.toFixed(2)} USD</p>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </Card>

                {/* Configuration */}
                <Card className="p-6 border-border/50">
                  <Label className="text-base font-semibold mb-4 block">Configuracion</Label>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="resolution" className="text-sm text-muted-foreground mb-2 block">Resolucion</Label>
                      <Select value={resolution} onValueChange={setResolution}>
                        <SelectTrigger id="resolution" className="border-border/50">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {resolutions.map((res) => (
                            <SelectItem key={res} value={res}>{res}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {currentModel?.type === 'video' && (
                      <div>
                        <Label htmlFor="duration" className="text-sm text-muted-foreground mb-2 block">Duracion</Label>
                        <Select value={duration} onValueChange={setDuration}>
                          <SelectTrigger id="duration" className="border-border/50">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {durations.map((dur) => (
                              <SelectItem key={dur} value={dur}>{dur}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}

                    <div>
                      <Label htmlFor="style" className="text-sm text-muted-foreground mb-2 block">Estilo</Label>
                      <Select value={style} onValueChange={setStyle}>
                        <SelectTrigger id="style" className="border-border/50">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {styles.map((s) => (
                            <SelectItem key={s} value={s}>{s}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Cost Card - Sticky */}
              <div className="lg:col-span-1">
                <Card className="p-6 border-border/50 sticky top-24">
                  <h3 className="font-semibold mb-4">Resumen</h3>

                  {/* Cost display */}
                  <div className="bg-gradient-to-br from-violet-500/10 to-purple-500/10 rounded-xl p-5 mb-6 border border-primary/20">
                    <div className="text-sm text-muted-foreground mb-1">Costo total</div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-bold text-primary">${estimatedCost.toFixed(2)}</span>
                      <span className="text-muted-foreground">USD</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      Pagado via protocolo x402 (USDC)
                    </p>
                  </div>

                  {/* Details */}
                  <div className="space-y-3 mb-6">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Modelo</span>
                      <span className="font-medium">{currentModel?.name || '-'}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Tipo</span>
                      <span className="font-medium capitalize flex items-center gap-1.5">
                        {currentModel?.type === 'image' ? (
                          <Image className="size-3.5 text-blue-600" />
                        ) : (
                          <Video className="size-3.5 text-pink-600" />
                        )}
                        {currentModel?.type || '-'}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Resolucion</span>
                      <span className="font-medium">{resolution}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Estilo</span>
                      <span className="font-medium">{style}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Red</span>
                      <span className="font-medium">{config.x402.network}</span>
                    </div>
                  </div>

                  {/* Generate button */}
                  <Button
                    className="w-full gap-2 py-6 text-base shadow-lg shadow-primary/25"
                    size="lg"
                    onClick={handleGenerate}
                    disabled={!canGenerate || isGenerating}
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="size-5 animate-spin" />
                        {generationStep || 'Procesando...'}
                      </>
                    ) : (
                      <>
                        <Sparkles className="size-5" />
                        Generar con x402
                      </>
                    )}
                  </Button>

                  {!isUsingMock && !walletState.isConnected && (
                    <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                      <p className="text-sm text-yellow-700 flex items-center gap-2">
                        <Wallet className="size-4" />
                        Conecta tu wallet para generar
                      </p>
                    </div>
                  )}


                  {/* Network info */}
                  <div className="mt-4 p-3 bg-secondary/50 rounded-lg">
                    <p className="text-xs text-muted-foreground">
                      <strong>Facilitador:</strong> {config.x402.facilitatorUrl}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      <strong>Receptor:</strong> {config.x402.walletAddress.slice(0, 10)}...
                    </p>
                  </div>
                </Card>
              </div>
            </div>

            {/* Loading State */}
            {isGenerating && (
              <Card className="p-8 border-border/50 mt-6">
                <div className="text-center">
                  <div className="relative inline-flex mb-6">
                    <div className="size-20 bg-gradient-to-br from-violet-500/20 to-purple-500/20 rounded-2xl flex items-center justify-center animate-pulse">
                      <Sparkles className="size-10 text-primary" />
                    </div>
                    <div className="absolute -bottom-1 -right-1 size-8 bg-gradient-to-br from-violet-500 to-purple-600 rounded-lg flex items-center justify-center">
                      <Loader2 className="size-4 text-white animate-spin" />
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold mb-2">
                    {generationStep || 'Procesando tu solicitud'}
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    {isUsingMock
                      ? 'Simulando generacion con IA...'
                      : 'La wallet firmara la transaccion automaticamente'
                    }
                  </p>
                  <div className="max-w-xs mx-auto h-2 bg-secondary rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-violet-500 to-purple-600 rounded-full animate-pulse" style={{ width: '60%' }} />
                  </div>
                </div>
              </Card>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
