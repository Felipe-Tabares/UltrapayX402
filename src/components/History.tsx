import { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Label } from './ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Image, Video, Eye } from 'lucide-react';
import type { View, GeneratedContent } from '../App';

interface HistoryProps {
  history: GeneratedContent[];
  onNavigate: (view: View) => void;
}

export function History({ history, onNavigate }: HistoryProps) {
  const [filterType, setFilterType] = useState<string>('all');
  const [filterModel, setFilterModel] = useState<string>('all');

  const filteredHistory = history.filter((item) => {
    const typeMatch = filterType === 'all' || item.type === filterType;
    const modelMatch = filterModel === 'all' || item.model === filterModel;
    return typeMatch && modelMatch;
  });

  const uniqueModels = Array.from(new Set(history.map(item => item.model)));

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar currentView="history" onNavigate={onNavigate} />
      
      <div className="flex-1">
        <Header balance={150} onNavigate={onNavigate} />
        
        <main className="p-8">
          <div className="max-w-7xl mx-auto">
            <h1 className="mb-8">Historial de generaciones</h1>
            
            {/* Filters */}
            <Card className="p-6 border-border mb-6">
              <div className="grid md:grid-cols-4 gap-4">
                <div>
                  <Label htmlFor="filter-type" className="mb-2 block">Tipo de contenido</Label>
                  <Select value={filterType} onValueChange={setFilterType}>
                    <SelectTrigger id="filter-type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="image">Imágenes</SelectItem>
                      <SelectItem value="video">Videos</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="filter-model" className="mb-2 block">Modelo</Label>
                  <Select value={filterModel} onValueChange={setFilterModel}>
                    <SelectTrigger id="filter-model">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      {uniqueModels.map((model) => (
                        <SelectItem key={model} value={model}>{model}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-end">
                  <Button variant="outline" onClick={() => {
                    setFilterType('all');
                    setFilterModel('all');
                  }}>
                    Limpiar filtros
                  </Button>
                </div>
              </div>
            </Card>

            {/* Table */}
            <Card className="border-border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12"></TableHead>
                    <TableHead>Prompt</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Modelo</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead className="text-right">Costo</TableHead>
                    <TableHead className="text-right">Accion</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredHistory.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                        No se encontraron resultados
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredHistory.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          <div className="size-10 bg-secondary rounded overflow-hidden">
                            <img
                              src={item.url}
                              alt={item.prompt}
                              className="size-full object-cover"
                            />
                          </div>
                        </TableCell>
                        <TableCell className="max-w-md">
                          <div className="truncate">{item.prompt}</div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {item.type === 'image' ? (
                              <Image className="size-4 text-primary" />
                            ) : (
                              <Video className="size-4 text-primary" />
                            )}
                            <span className="capitalize">{item.type}</span>
                          </div>
                        </TableCell>
                        <TableCell>{item.model}</TableCell>
                        <TableCell>{item.date}</TableCell>
                        <TableCell className="text-right text-primary font-medium">{item.cost.toFixed(2)} x402</TableCell>
                        <TableCell className="text-right">
                          <Button size="sm" variant="ghost">
                            <Eye className="size-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </Card>

            {/* Summary */}
            <div className="grid md:grid-cols-3 gap-6 mt-6">
              <Card className="p-6 border-border">
                <div className="text-sm text-muted-foreground mb-1">Total generaciones</div>
                <div className="text-3xl text-primary">{history.length}</div>
              </Card>

              <Card className="p-6 border-border">
                <div className="text-sm text-muted-foreground mb-1">Gasto total</div>
                <div className="text-3xl text-primary">
                  {history.reduce((sum, item) => sum + item.cost, 0).toFixed(2)} x402
                </div>
              </Card>

              <Card className="p-6 border-border">
                <div className="text-sm text-muted-foreground mb-1">Promedio por generacion</div>
                <div className="text-3xl text-primary">
                  {history.length > 0
                    ? (history.reduce((sum, item) => sum + item.cost, 0) / history.length).toFixed(2)
                    : '0.00'
                  } x402
                </div>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
