import { LayoutDashboard, Sparkles, History, Settings, Wallet, LogOut } from 'lucide-react';
import type { View } from '../App';

interface SidebarProps {
  currentView: View;
  onNavigate: (view: View) => void;
  onDisconnect?: () => void;
}

export function Sidebar({ currentView, onNavigate, onDisconnect }: SidebarProps) {
  const menuItems = [
    { id: 'dashboard' as View, icon: LayoutDashboard, label: 'Dashboard' },
    { id: 'generate' as View, icon: Sparkles, label: 'Generar' },
    { id: 'history' as View, icon: History, label: 'Historial' },
    { id: 'settings' as View, icon: Settings, label: 'Ajustes' },
  ];

  return (
    <div className="w-64 bg-card/50 backdrop-blur-xl border-r border-border/50 flex flex-col">
      {/* Logo - Clickable to go to Landing */}
      <div className="p-6">
        <button
          onClick={() => onNavigate('landing')}
          className="flex items-center gap-3 hover:opacity-80 transition-opacity w-full text-left"
        >
          <div className="relative">
            <div className="absolute inset-0 bg-violet-500/30 blur-2xl rounded-full scale-150" />
            <img
              src="/img/logoultrapya.png"
              alt="UltraPayx402"
              className="h-14 w-auto relative drop-shadow-xl"
            />
          </div>
          <div>
            <span className="font-semibold text-xl text-foreground">UltraPayx402</span>
            <p className="text-sm text-muted-foreground">Micropagos IA</p>
          </div>
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-2">
        <div className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;

            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-to-r from-violet-500 to-purple-600 text-white shadow-lg shadow-violet-500/25'
                    : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                }`}
              >
                <Icon className="size-5" />
                <span className="font-medium">{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Bottom section */}
      <div className="p-4 border-t border-border/50">
        <div className="bg-gradient-to-br from-violet-500/10 to-purple-500/10 rounded-xl p-4 mb-4">
          <p className="text-sm font-medium mb-1 text-foreground">Necesitas ayuda?</p>
          <p className="text-xs text-muted-foreground mb-3">Consulta nuestra documentacion</p>
          <a href="#" className="text-xs text-primary font-medium hover:underline">
            Ver guia rapida →
          </a>
        </div>

        <button
          onClick={onDisconnect}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
        >
          <LogOut className="size-5" />
          <span className="font-medium">Desconectar</span>
        </button>
      </div>
    </div>
  );
}
