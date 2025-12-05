import { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Label } from './ui/label';
import { Loader2, Sparkles } from 'lucide-react';
import type { View, GeneratedContent } from '../App';

interface GenerateProps {
  balance: number;
  onNavigate: (view: View) => void;
  onGenerate: (content: Omit<GeneratedContent, 'id' | 'date'>) => void;
}

const models = [
  { id: 'sd35', name: 'SD3.5', type: 'image', cost: 0.15 },
  { id: 'veo3', name: 'Veo 3', type: 'video', cost: 0.85 },
  { id: 'runway', name: 'Runway Gen-3', type: 'video', cost: 1.20 },
  { id: 'nanobanana', name: 'NanoBanana', type: 'image', cost: 0.10 },
  { id: 'midjourney', name: 'Midjourney', type: 'image', cost: 0.20 },
];

const resolutions = ['512x512', '1024x1024', '1920x1080', '2048x2048'];
const durations = ['5s', '10s', '15s', '30s'];
const styles = ['Realista', 'Artístico', 'Anime', 'Abstracto', '3D Render'];

export function Generate({ balance, onNavigate, onGenerate }: GenerateProps) {
  const [prompt, setPrompt] = useState('');
  const [selectedModel, setSelectedModel] = useState('sd35');
  const [resolution, setResolution] = useState('1024x1024');
  const [duration, setDuration] = useState('10s');
  const [style, setStyle] = useState('Realista');
  const [isGenerating, setIsGenerating] = useState(false);

  const currentModel = models.find(m => m.id === selectedModel);
  const estimatedCost = currentModel?.cost || 0;

  const handleGenerate = async () => {
    if (!prompt.trim() || !currentModel) return;
    
    setIsGenerating(true);
    
    // Simulate generation delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const mockUrls = [
      'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800',
      'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800',
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
      'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=800',
    ];
    
    onGenerate({
      prompt,
      type: currentModel.type as 'image' | 'video',
      model: currentModel.name,
      cost: estimatedCost,
      url: mockUrls[Math.floor(Math.random() * mockUrls.length)],
    });
    
    setIsGenerating(false);
  };

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar currentView="generate" onNavigate={onNavigate} />
      
      <div className="flex-1">
        <Header balance={balance} onNavigate={onNavigate} />
        
        <main className="p-8">
          <div className="max-w-4xl mx-auto">
            <h1 className="mb-8">Generar contenido IA</h1>
            
            <div className="grid md:grid-cols-3 gap-6">
              {/* Main Form */}
              <div className="md:col-span-2 space-y-6">
                <Card className="p-6 border-border">
                  <Label htmlFor="prompt" className="mb-2 block">Describe lo que quieres crear</Label>
                  <Textarea
                    id="prompt"
                    placeholder="Ej: Un paisaje futurista con montañas flotantes y luces neón..."
                    className="min-h-32 resize-none"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                  />
                </Card>

                <Card className="p-6 border-border">
                  <h3 className="mb-4">Configuracion</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="model" className="mb-2 block">Modelo de IA</Label>
                      <Select value={selectedModel} onValueChange={setSelectedModel}>
                        <SelectTrigger id="model">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {models.map((model) => (
                            <SelectItem key={model.id} value={model.id}>
                              {model.name} ({model.type}) - {model.cost.toFixed(2)} x402
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="resolution" className="mb-2 block">Resolución</Label>
                        <Select value={resolution} onValueChange={setResolution}>
                          <SelectTrigger id="resolution">
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
                          <Label htmlFor="duration" className="mb-2 block">Duración</Label>
                          <Select value={duration} onValueChange={setDuration}>
                            <SelectTrigger id="duration">
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
                        <Label htmlFor="style" className="mb-2 block">Estilo</Label>
                        <Select value={style} onValueChange={setStyle}>
                          <SelectTrigger id="style">
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
                  </div>
                </Card>
              </div>

              {/* Cost Card */}
              <div className="md:col-span-1">
                <Card className="p-6 border-border sticky top-8">
                  <h3 className="mb-4">Costo estimado</h3>

                  <div className="bg-secondary rounded-lg p-4 mb-6">
                    <div className="text-sm text-muted-foreground mb-1">Total a pagar</div>
                    <div className="text-3xl text-primary font-medium">{estimatedCost.toFixed(2)}</div>
                    <div className="text-sm text-muted-foreground">x402</div>
                  </div>

                  <div className="space-y-2 mb-6 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Modelo</span>
                      <span>{currentModel?.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Tipo</span>
                      <span className="capitalize">{currentModel?.type}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Resolucion</span>
                      <span>{resolution}</span>
                    </div>
                  </div>

                  <Button 
                    className="w-full gap-2" 
                    size="lg"
                    onClick={handleGenerate}
                    disabled={!prompt.trim() || isGenerating || balance < estimatedCost}
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="size-4 animate-spin" />
                        Generando...
                      </>
                    ) : (
                      <>
                        <Sparkles className="size-4" />
                        Generar con micropago x402
                      </>
                    )}
                  </Button>

                  {balance < estimatedCost && (
                    <p className="text-sm text-red-600 mt-2">Saldo insuficiente</p>
                  )}
                </Card>
              </div>
            </div>

            {/* Loading State */}
            {isGenerating && (
              <Card className="p-8 border-border mt-6">
                <div className="text-center">
                  <Loader2 className="size-8 animate-spin mx-auto mb-4 text-primary" />
                  <h3 className="mb-2">Generando tu contenido</h3>
                  <p className="text-muted-foreground">Esto puede tomar unos segundos...</p>
                </div>
              </Card>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
