import { useState } from 'react';
import { Sparkles, Zap, CreditCard, ArrowRight, Play, Shield, Globe, Loader2, AlertCircle, Wallet, LogOut, ChevronDown, Moon, Sun } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { useTheme } from '../contexts/ThemeContext';

interface LandingProps {
  onConnectWallet: () => void;
  onGoToDashboard?: () => void;
  onDisconnect?: () => void;
  isConnecting?: boolean;
  isConnected?: boolean;
  walletAddress?: string | null;
  error?: string | null;
}

export function Landing({ onConnectWallet, onGoToDashboard, onDisconnect, isConnecting = false, isConnected = false, walletAddress, error }: LandingProps) {
  const [showWalletMenu, setShowWalletMenu] = useState(false);
  const { theme, toggleTheme } = useTheme();

  const benefits = [
    {
      icon: CreditCard,
      title: 'Sin suscripciones',
      description: 'Paga solo por lo que generas, sin cuotas mensuales ni compromisos.',
      gradient: 'from-violet-500 to-purple-600'
    },
    {
      icon: Zap,
      title: 'Pago por prompt',
      description: 'Micropagos instantaneos usando el protocolo x402 por cada generacion.',
      gradient: 'from-purple-500 to-indigo-600'
    },
    {
      icon: Sparkles,
      title: 'Modelos premium',
      description: 'Accede a SD3.5, Veo 3, Runway Gen-3, Midjourney y mas.',
      gradient: 'from-indigo-500 to-violet-600'
    }
  ];

  const steps = [
    {
      number: '01',
      title: 'Conecta tu Wallet',
      description: 'Vincula tu wallet compatible con x402 en segundos',
      icon: Shield
    },
    {
      number: '02',
      title: 'Describe tu vision',
      description: 'Escribe un prompt detallado de lo que quieres crear',
      icon: Play
    },
    {
      number: '03',
      title: 'Recibe al instante',
      description: 'Micropago automatico y contenido generado en segundos',
      icon: Globe
    }
  ];

  const stats = [
    { value: '50K+', label: 'Generaciones' },
    { value: '0.10', label: 'x402 minimo' },
    { value: '5+', label: 'Modelos IA' },
    { value: '< 30s', label: 'Tiempo promedio' }
  ];

  return (
    <div className="min-h-screen overflow-hidden bg-background">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-background/80 border-b border-border/50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="absolute inset-0 bg-violet-500/30 blur-2xl rounded-full scale-150" />
                <img
                  src="public/img/logoultrapya.png"
                  alt="UltraPayx402"
                  className="h-14 w-auto relative drop-shadow-xl"
                />
              </div>
              <div>
                <span className="font-semibold text-xl text-white">UltraPayx402</span>
                <p className="text-sm text-muted-foreground">Micropagos IA</p>
              </div>
              <span className="font-semibold text-lg text-foreground">UltraPayx402</span>
            </div>
            <div className="flex items-center gap-3">
              {/* Theme toggle */}
              <button
                onClick={toggleTheme}
                className="size-9 rounded-xl bg-secondary/50 hover:bg-secondary flex items-center justify-center transition-colors"
                title={theme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
              >
                {theme === 'dark' ? (
                  <Sun className="size-4 text-muted-foreground" />
                ) : (
                  <Moon className="size-4 text-muted-foreground" />
                )}
              </button>

              {isConnected && walletAddress && (
                <div className="relative">
                  <button
                    onClick={() => setShowWalletMenu(!showWalletMenu)}
                    className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-lg hover:bg-green-500/20 transition-colors"
                  >
                    <div className="size-6 bg-gradient-to-br from-green-500 to-emerald-600 rounded-md flex items-center justify-center">
                      <Wallet className="size-3 text-white" />
                    </div>
                    <span className="font-mono text-sm text-green-700 dark:text-green-400">
                      {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
                    </span>
                    <ChevronDown className={`size-4 text-green-700 dark:text-green-400 transition-transform ${showWalletMenu ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Dropdown menu */}
                  {showWalletMenu && (
                    <>
                      <div
                        className="fixed inset-0 z-40"
                        onClick={() => setShowWalletMenu(false)}
                      />
                      <div className="absolute right-0 mt-2 w-48 bg-card border border-border rounded-xl shadow-lg py-2 z-50">
                        <button
                          onClick={() => {
                            setShowWalletMenu(false);
                            onGoToDashboard?.();
                          }}
                          className="w-full px-4 py-2 text-left text-sm hover:bg-secondary flex items-center gap-2 text-foreground"
                        >
                          <ArrowRight className="size-4" />
                          Ir al Dashboard
                        </button>
                        <button
                          onClick={() => {
                            setShowWalletMenu(false);
                            onDisconnect?.();
                          }}
                          className="w-full px-4 py-2 text-left text-sm hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 flex items-center gap-2"
                        >
                          <LogOut className="size-4" />
                          Desconectar
                        </button>
                      </div>
                    </>
                  )}
                </div>
              )}
              {isConnected ? (
                <Button onClick={onGoToDashboard} className="shadow-lg shadow-primary/25 gap-2">
                  Ir al Dashboard
                  <ArrowRight className="size-4" />
                </Button>
              ) : (
                <Button onClick={onConnectWallet} disabled={isConnecting} className="shadow-lg shadow-primary/25">
                  {isConnecting ? (
                    <>
                      <Loader2 className="size-4 animate-spin mr-2" />
                      Conectando...
                    </>
                  ) : (
                    'Conectar Wallet'
                  )}
                </Button>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative pt-32 pb-20 md:pt-40 md:pb-32">
        {/* Background effects */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-violet-500/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse delay-1000" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-violet-500/10 to-purple-500/10 rounded-full blur-3xl" />
        </div>

        <div className="container mx-auto px-4 relative">
          <div className="max-w-4xl mx-auto text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-violet-500/10 to-purple-500/10 border border-violet-500/20 rounded-full mb-8 backdrop-blur-sm">
              <div className="size-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-sm font-medium text-violet-700 dark:text-violet-400">Protocolo x402 Activo</span>
            </div>

            {/* Heading */}
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight text-foreground">
              Genera contenido IA{' '}
              <span className="bg-gradient-to-r from-violet-500 via-purple-500 to-indigo-500 bg-clip-text text-transparent">
                pagando por uso
              </span>
            </h1>

            {/* Subheading */}
            <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
              Crea imagenes y videos profesionales con los mejores modelos de IA.
              Sin suscripciones, solo micropagos instantaneos.
            </p>

            {/* Error message */}
            {error && (
              <div className="flex items-center justify-center gap-2 mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-xl max-w-md mx-auto">
                <AlertCircle className="size-5 text-destructive" />
                <p className="text-sm text-destructive">{error}</p>
              </div>
            )}

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
              {isConnected ? (
                <Button
                  size="lg"
                  onClick={onGoToDashboard}
                  className="gap-2 text-base px-8 py-6 shadow-xl shadow-primary/30 hover:shadow-2xl hover:shadow-primary/40 transition-all duration-300 hover:-translate-y-0.5"
                >
                  Ir al Dashboard
                  <ArrowRight className="size-5" />
                </Button>
              ) : (
                <Button
                  size="lg"
                  onClick={onConnectWallet}
                  disabled={isConnecting}
                  className="gap-2 text-base px-8 py-6 shadow-xl shadow-primary/30 hover:shadow-2xl hover:shadow-primary/40 transition-all duration-300 hover:-translate-y-0.5"
                >
                  {isConnecting ? (
                    <>
                      <Loader2 className="size-5 animate-spin" />
                      Conectando wallet...
                    </>
                  ) : (
                    <>
                      Comenzar ahora
                      <ArrowRight className="size-5" />
                    </>
                  )}
                </Button>
              )}
              <Button
                size="lg"
                variant="outline"
                className="gap-2 text-base px-8 py-6 border-2 hover:bg-secondary/80 transition-all duration-300"
              >
                <Play className="size-5" />
                Ver demo
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto">
              {stats.map((stat, index) => (
                <div key={index} className="text-center p-4">
                  <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
                    {stat.value}
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Benefits Section */}
      <div className="py-20 md:py-32 bg-gradient-to-b from-secondary/30 to-background">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            {/* Section header */}
            <div className="text-center mb-16">
              <span className="text-sm font-semibold text-primary uppercase tracking-wider">Ventajas</span>
              <h2 className="text-3xl md:text-4xl font-bold mt-3 mb-4 text-foreground">Por que elegir UltraPayx402</h2>
              <p className="text-muted-foreground max-w-xl mx-auto">
                La forma mas inteligente de acceder a generacion de contenido con IA
              </p>
            </div>

            {/* Cards */}
            <div className="grid md:grid-cols-3 gap-6">
              {benefits.map((benefit, index) => {
                const Icon = benefit.icon;
                return (
                  <Card
                    key={index}
                    className="group p-8 bg-card/50 backdrop-blur-sm border-border/50 hover:border-primary/50 transition-all duration-500 hover:shadow-xl hover:shadow-primary/10 hover:-translate-y-1"
                  >
                    <div className={`size-14 bg-gradient-to-br ${benefit.gradient} rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                      <Icon className="size-7 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold mb-3 text-foreground">{benefit.title}</h3>
                    <p className="text-muted-foreground leading-relaxed">{benefit.description}</p>
                  </Card>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* How it Works Section */}
      <div className="py-20 md:py-32">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            {/* Section header */}
            <div className="text-center mb-16">
              <span className="text-sm font-semibold text-primary uppercase tracking-wider">Proceso</span>
              <h2 className="text-3xl md:text-4xl font-bold mt-3 mb-4 text-foreground">Como funciona</h2>
              <p className="text-muted-foreground max-w-xl mx-auto">
                Tres simples pasos para comenzar a generar contenido
              </p>
            </div>

            {/* Steps */}
            <div className="grid md:grid-cols-3 gap-8 relative">
              {/* Connector line - desktop only */}
              <div className="hidden md:block absolute top-16 left-1/6 right-1/6 h-0.5 bg-gradient-to-r from-transparent via-primary/30 to-transparent" />

              {steps.map((step, index) => {
                const Icon = step.icon;
                return (
                  <div key={index} className="relative text-center group">
                    {/* Step number circle */}
                    <div className="relative inline-flex mb-6">
                      <div className="size-32 rounded-3xl bg-gradient-to-br from-violet-500/10 to-purple-500/10 flex items-center justify-center border border-primary/20 group-hover:border-primary/50 transition-all duration-300 group-hover:scale-105">
                        <Icon className="size-12 text-primary/70 group-hover:text-primary transition-colors duration-300" />
                      </div>
                      <div className="absolute -top-2 -right-2 size-8 bg-gradient-to-br from-violet-500 to-purple-600 rounded-lg flex items-center justify-center text-white text-sm font-bold shadow-lg">
                        {step.number}
                      </div>
                    </div>
                    <h3 className="text-xl font-semibold mb-3 text-foreground">{step.title}</h3>
                    <p className="text-muted-foreground leading-relaxed max-w-xs mx-auto">{step.description}</p>
                  </div>
                );
              })}
            </div>

            {/* CTA */}
            <div className="text-center mt-16">
              {isConnected ? (
                <Button
                  size="lg"
                  onClick={onGoToDashboard}
                  className="gap-2 text-base px-8 py-6 shadow-xl shadow-primary/30"
                >
                  Ir al Dashboard
                  <ArrowRight className="size-5" />
                </Button>
              ) : (
                <Button
                  size="lg"
                  onClick={onConnectWallet}
                  disabled={isConnecting}
                  className="gap-2 text-base px-8 py-6 shadow-xl shadow-primary/30"
                >
                  {isConnecting ? (
                    <>
                      <Loader2 className="size-5 animate-spin" />
                      Conectando...
                    </>
                  ) : (
                    <>
                      Conectar Wallet y empezar
                      <ArrowRight className="size-5" />
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-20 md:py-32">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <Card className="relative overflow-hidden p-12 md:p-16 bg-gradient-to-br from-violet-600 to-purple-700 border-0">
              {/* Background pattern */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-0 left-0 w-64 h-64 bg-white rounded-full blur-3xl" />
                <div className="absolute bottom-0 right-0 w-64 h-64 bg-white rounded-full blur-3xl" />
              </div>

              <div className="relative text-center text-white">
                <h2 className="text-3xl md:text-4xl font-bold mb-4">
                  Listo para crear contenido increible?
                </h2>
                <p className="text-lg text-white/80 mb-8 max-w-xl mx-auto">
                  Conecta tu wallet ahora y empieza a generar imagenes y videos con los mejores modelos de IA.
                </p>
                {isConnected ? (
                  <Button
                    size="lg"
                    onClick={onGoToDashboard}
                    className="bg-white text-violet-700 hover:bg-white/90 gap-2 text-base px-8 py-6 shadow-xl"
                  >
                    Ir al Dashboard
                    <ArrowRight className="size-5" />
                  </Button>
                ) : (
                  <Button
                    size="lg"
                    onClick={onConnectWallet}
                    disabled={isConnecting}
                    className="bg-white text-violet-700 hover:bg-white/90 gap-2 text-base px-8 py-6 shadow-xl"
                  >
                    {isConnecting ? (
                      <>
                        <Loader2 className="size-5 animate-spin" />
                        Conectando...
                      </>
                    ) : (
                      <>
                        Conectar Wallet x402
                        <ArrowRight className="size-5" />
                      </>
                    )}
                  </Button>
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-border/50 py-12 bg-secondary/20">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-center gap-6">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="absolute inset-0 bg-violet-500/30 blur-2xl rounded-full scale-150" />
                  <img
                    src="/img/logoultrapya.png"
                    alt="UltraPayx402"
                    className="h-14 w-auto relative drop-shadow-xl"
                  />
                </div>
                <div>
                  <span className="font-semibold text-foreground text-lg">UltraPayx402</span>
                  <p className="text-sm text-muted-foreground">Micropagos IA</p>
                </div>
              </div>
              <div className="flex items-center gap-8 text-sm text-muted-foreground">
                <a href="#" className="hover:text-primary transition-colors">Terminos</a>
                <a href="#" className="hover:text-primary transition-colors">Privacidad</a>
                <a href="#" className="hover:text-primary transition-colors">Contacto</a>
              </div>
              <div className="text-sm text-muted-foreground">
                2025 UltraPayx402
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
