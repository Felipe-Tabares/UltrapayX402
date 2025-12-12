import { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Image, Video, TrendingUp, Sparkles, ArrowRight, Clock, Zap } from 'lucide-react';
import { ImageModal } from './ImageModal';
import type { View, GeneratedContent } from '../App';
import type { WalletState } from '../services/x402';

interface DashboardProps {
  onNavigate: (view: View) => void;
  history: GeneratedContent[];
  onDisconnect: () => void;
  walletAddress?: string | null;
  onWalletChange?: (state: WalletState) => void;
  onToggleFavorite: (id: string) => Promise<void>;
}

export function Dashboard({ onNavigate, history, onDisconnect, walletAddress, onWalletChange, onToggleFavorite }: DashboardProps) {
  const [selectedImage, setSelectedImage] = useState<GeneratedContent | null>(null);
  const monthlySpend = history.reduce((sum, item) => sum + item.cost, 0);
  const imageCount = history.filter(item => item.type === 'image').length;
  const videoCount = history.filter(item => item.type === 'video').length;

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar currentView="dashboard" onNavigate={onNavigate} onDisconnect={onDisconnect} />

      <div className="flex-1">
        <Header walletAddress={walletAddress} onNavigate={onNavigate} onWalletChange={onWalletChange} onDisconnect={onDisconnect} />

        <main className="p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {/* Welcome Section */}
            <div className="mb-8">
              <h1 className="text-2xl lg:text-3xl font-bold mb-2 text-foreground">Bienvenido de vuelta</h1>
              <p className="text-muted-foreground">Crea contenido increible con IA hoy</p>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <Card className="p-5 border-border/50 bg-card/50 backdrop-blur-sm">
                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-xl bg-gradient-to-br from-violet-500/20 to-purple-500/20 flex items-center justify-center">
                    <TrendingUp className="size-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Gasto total</p>
                    <p className="text-xl font-bold text-primary">{monthlySpend.toFixed(2)} x402</p>
                  </div>
                </div>
              </Card>

              <Card className="p-5 border-border/50 bg-card/50 backdrop-blur-sm">
                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center">
                    <Image className="size-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Imagenes</p>
                    <p className="text-xl font-bold text-foreground">{imageCount}</p>
                  </div>
                </div>
              </Card>

              <Card className="p-5 border-border/50 bg-card/50 backdrop-blur-sm">
                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-xl bg-gradient-to-br from-pink-500/20 to-rose-500/20 flex items-center justify-center">
                    <Video className="size-5 text-pink-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Videos</p>
                    <p className="text-xl font-bold text-foreground">{videoCount}</p>
                  </div>
                </div>
              </Card>

              <Card className="p-5 border-border/50 bg-card/50 backdrop-blur-sm">
                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 flex items-center justify-center">
                    <Zap className="size-5 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Generaciones</p>
                    <p className="text-xl font-bold text-foreground">{history.length}</p>
                  </div>
                </div>
              </Card>
            </div>

            {/* Create Actions */}
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <Card
                className="group relative overflow-hidden p-8 border-border/50 hover:border-primary/50 transition-all duration-500 hover:shadow-xl hover:shadow-primary/10 cursor-pointer"
                onClick={() => onNavigate('generate')}
              >
                {/* Background gradient */}
                <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                <div className="relative">
                  <div className="size-14 bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-violet-500/25 group-hover:scale-110 transition-transform duration-300">
                    <Image className="size-7 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2 text-foreground">Crear imagen</h3>
                  <p className="text-muted-foreground mb-6">
                    Genera imagenes unicas con modelos como SD3.5, Midjourney y NanoBanana
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Desde <span className="text-primary font-semibold">0.10 x402</span></span>
                    <Button variant="ghost" size="sm" className="gap-2 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                      Crear <ArrowRight className="size-4" />
                    </Button>
                  </div>
                </div>
              </Card>

              <Card
                className="group relative overflow-hidden p-8 border-border/50 hover:border-primary/50 transition-all duration-500 hover:shadow-xl hover:shadow-primary/10 cursor-pointer"
                onClick={() => onNavigate('generate')}
              >
                {/* Background gradient */}
                <div className="absolute inset-0 bg-gradient-to-br from-pink-500/5 to-rose-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                <div className="relative">
                  <div className="size-14 bg-gradient-to-br from-pink-500 to-rose-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-pink-500/25 group-hover:scale-110 transition-transform duration-300">
                    <Video className="size-7 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2 text-foreground">Crear video</h3>
                  <p className="text-muted-foreground mb-6">
                    Genera videos impresionantes con Veo 3 y Runway Gen-3
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Desde <span className="text-primary font-semibold">0.50 x402</span></span>
                    <Button variant="ghost" size="sm" className="gap-2 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                      Crear <ArrowRight className="size-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            </div>

            {/* Recent History */}
            <div>
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-xl font-semibold text-foreground">Historial reciente</h2>
                  <p className="text-sm text-muted-foreground">Tus ultimas generaciones</p>
                </div>
                <Button variant="ghost" onClick={() => onNavigate('history')} className="gap-2">
                  Ver todo <ArrowRight className="size-4" />
                </Button>
              </div>

              {history.length === 0 ? (
                <Card className="p-12 border-border/50 border-dashed">
                  <div className="text-center">
                    <div className="size-16 bg-gradient-to-br from-violet-500/10 to-purple-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <Sparkles className="size-8 text-primary/50" />
                    </div>
                    <h3 className="font-semibold mb-2 text-foreground">Sin generaciones aun</h3>
                    <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
                      Comienza a crear contenido increible con IA. Tu historial aparecera aqui.
                    </p>
                    <Button onClick={() => onNavigate('generate')} className="gap-2">
                      <Sparkles className="size-4" />
                      Crear mi primera imagen
                    </Button>
                  </div>
                </Card>
              ) : (
                <div className="grid gap-4">
                  {history.slice(0, 5).map((item) => (
                    <Card
                      key={item.id}
                      className="group p-4 border-border/50 hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 cursor-pointer overflow-hidden"
                      onClick={() => setSelectedImage(item)}
                    >
                      <div className="flex items-center gap-3 lg:gap-4 min-w-0">
                        {/* Thumbnail */}
                        <div className="size-14 sm:size-16 lg:size-20 rounded-xl overflow-hidden flex-shrink-0 bg-secondary">
                          <img
                            src={item.url}
                            alt={item.prompt}
                            className="size-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0 overflow-hidden">
                          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-1">
                            {item.type === 'image' ? (
                              <div className="flex items-center gap-1 text-xs font-medium text-blue-600 bg-blue-500/10 px-2 py-0.5 rounded-full flex-shrink-0">
                                <Image className="size-3" />
                                <span className="hidden xs:inline">Imagen</span>
                              </div>
                            ) : (
                              <div className="flex items-center gap-1 text-xs font-medium text-pink-600 bg-pink-500/10 px-2 py-0.5 rounded-full flex-shrink-0">
                                <Video className="size-3" />
                                <span className="hidden xs:inline">Video</span>
                              </div>
                            )}
                            <span className="text-xs text-muted-foreground bg-secondary px-2 py-0.5 rounded-full truncate max-w-[120px] sm:max-w-[150px] flex-shrink-0">
                              {item.model}
                            </span>
                          </div>
                          <p className="font-medium truncate mb-1 text-sm sm:text-base text-foreground">{item.prompt}</p>
                          <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
                            <span className="flex items-center gap-1 truncate">
                              <Clock className="size-3 flex-shrink-0" />
                              <span className="truncate">{item.date}</span>
                            </span>
                          </div>
                        </div>

                        {/* Cost */}
                        <div className="text-right flex-shrink-0 min-w-[60px] sm:min-w-[70px]">
                          <div className="text-base sm:text-lg font-bold text-primary">{item.cost.toFixed(2)}</div>
                          <div className="text-xs text-muted-foreground">x402</div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Image Modal */}
      {selectedImage && (
        <ImageModal
          content={selectedImage}
          isOpen={!!selectedImage}
          onClose={() => setSelectedImage(null)}
          onToggleFavorite={async (id) => {
            await onToggleFavorite(id);
            // Actualizar el estado local del modal
            const updated = history.find(h => h.id === id);
            if (updated) {
              setSelectedImage({ ...updated, isFavorite: !updated.isFavorite });
            }
          }}
        />
      )}
    </div>
  );
}
