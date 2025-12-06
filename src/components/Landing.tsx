import { Sparkles, Zap, CreditCard, ArrowRight, Play, Shield, Globe, Loader2, AlertCircle } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';

interface LandingProps {
  onConnectWallet: () => void;
  isConnecting?: boolean;
  error?: string | null;
}

export function Landing({ onConnectWallet, isConnecting = false, error }: LandingProps) {
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
    <div className="min-h-screen overflow-hidden">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-background/80 border-b border-border/50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="size-9 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-violet-500/25">
                <Sparkles className="size-5 text-white" />
              </div>
              <span className="font-semibold text-lg">UltraPayx402</span>
            </div>
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
              <span className="text-sm font-medium text-violet-700">Protocolo x402 Activo</span>
            </div>

            {/* Heading */}
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
              Genera contenido IA{' '}
              <span className="bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
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
              <h2 className="text-3xl md:text-4xl font-bold mt-3 mb-4">Por que elegir UltraPayx402</h2>
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
                    <h3 className="text-xl font-semibold mb-3">{benefit.title}</h3>
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
              <h2 className="text-3xl md:text-4xl font-bold mt-3 mb-4">Como funciona</h2>
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
                    <h3 className="text-xl font-semibold mb-3">{step.title}</h3>
                    <p className="text-muted-foreground leading-relaxed max-w-xs mx-auto">{step.description}</p>
                  </div>
                );
              })}
            </div>

            {/* CTA */}
            <div className="text-center mt-16">
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
                <div className="size-10 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <Sparkles className="size-5 text-white" />
                </div>
                <div>
                  <span className="font-semibold">UltraPayx402</span>
                  <p className="text-xs text-muted-foreground">Generacion IA con micropagos</p>
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
