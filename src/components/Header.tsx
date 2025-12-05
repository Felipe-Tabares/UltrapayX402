import { Button } from './ui/button';
import { Plus } from 'lucide-react';
import type { View } from '../App';

interface HeaderProps {
  balance: number;
  onNavigate: (view: View) => void;
}

export function Header({ balance, onNavigate }: HeaderProps) {
  return (
    <header className="bg-card border-b border-border px-8 py-4">
      <div className="flex justify-between items-center">
        <div></div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3 px-4 py-2 bg-secondary rounded-lg">
            <div>
              <div className="text-sm text-muted-foreground">Saldo disponible</div>
              <div className="text-primary font-medium">{balance.toFixed(2)} x402</div>
            </div>
          </div>

          <Button size="sm" className="gap-2">
            <Plus className="size-4" />
            Recargar
          </Button>
        </div>
      </div>
    </header>
  );
}
