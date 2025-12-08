import { useState } from 'react';
import { Wallet, Bell, ExternalLink, RefreshCw, Copy, Check, AlertCircle, LogOut } from 'lucide-react';
import type { View } from '../App';
import { switchAccount, type WalletState } from '../services/x402';

interface HeaderProps {
  walletAddress?: string | null;
  onNavigate: (view: View) => void;
  onWalletChange?: (state: WalletState) => void;
  onDisconnect?: () => void;
}

export function Header({ walletAddress, onNavigate, onWalletChange, onDisconnect }: HeaderProps) {
  const [isSwitching, setIsSwitching] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [switchError, setSwitchError] = useState<string | null>(null);

  // Abrir wallet en explorador de bloques (Base Sepolia)
  const openInExplorer = () => {
    if (walletAddress) {
      window.open(`https://sepolia.basescan.org/address/${walletAddress}`, '_blank');
    }
    setShowMenu(false);
  };

  // Copiar dirección completa
  const copyAddress = async () => {
    if (walletAddress) {
      await navigator.clipboard.writeText(walletAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Cambiar cuenta
  const handleSwitchAccount = async () => {
    setIsSwitching(true);
    setSwitchError(null);
    try {
      const newState = await switchAccount();
      setShowMenu(false);
      if (onWalletChange) {
        onWalletChange(newState);
      }
    } catch (error) {
      console.error('Error switching account:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error al cambiar cuenta';
      setSwitchError(errorMessage);
      // Si falla, intentar abrir MetaMask directamente
      if (typeof window !== 'undefined' && window.ethereum) {
        try {
          // Intentar con eth_requestAccounts como fallback
          await window.ethereum.request({ method: 'eth_requestAccounts' });
        } catch {
          // Ignorar error del fallback
        }
      }
    } finally {
      setIsSwitching(false);
    }
  };

  return (
    <header className="bg-card/50 backdrop-blur-xl border-b border-border/50 px-6 lg:px-8 py-4 sticky top-0 z-40">
      <div className="flex justify-between items-center">
        {/* Spacer */}
        <div></div>

        {/* Right side actions */}
        <div className="flex items-center gap-3 ml-auto">
          {/* Notifications */}
          <button className="size-10 rounded-xl bg-secondary/50 hover:bg-secondary flex items-center justify-center transition-colors relative">
            <Bell className="size-5 text-muted-foreground" />
          </button>

          {/* Wallet info with dropdown */}
          {walletAddress && (
            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="flex items-center gap-3 px-4 py-2 bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-xl hover:bg-green-500/20 transition-colors"
              >
                <div className="size-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
                  {isSwitching ? (
                    <RefreshCw className="size-4 text-white animate-spin" />
                  ) : (
                    <Wallet className="size-4 text-white" />
                  )}
                </div>
                <div className="text-left">
                  <div className="text-xs text-muted-foreground">Wallet Conectada</div>
                  <div className="font-mono text-sm text-green-700">
                    {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
                  </div>
                </div>
              </button>

              {/* Dropdown menu */}
              {showMenu && (
                <div className="absolute right-0 mt-2 w-64 bg-card border border-border rounded-xl shadow-lg py-2 z-50">
                  {/* Full address */}
                  <div className="px-4 py-2 border-b border-border">
                    <div className="text-xs text-muted-foreground mb-1">Dirección completa</div>
                    <div className="font-mono text-xs break-all text-foreground">
                      {walletAddress}
                    </div>
                  </div>

                  {/* Error/Info message */}
                  {switchError && (
                    <div className="px-4 py-2 border-b border-border bg-amber-50">
                      <div className="flex items-center gap-2 text-amber-700 text-xs">
                        <AlertCircle className="size-4 flex-shrink-0" />
                        <span>{switchError}</span>
                      </div>
                    </div>
                  )}

                  {/* Copy address */}
                  <button
                    onClick={copyAddress}
                    className="w-full px-4 py-2 text-left text-sm hover:bg-secondary flex items-center gap-2"
                  >
                    {copied ? (
                      <>
                        <Check className="size-4 text-green-600" />
                        <span className="text-green-600">Copiada!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="size-4" />
                        Copiar dirección
                      </>
                    )}
                  </button>

                  {/* View in explorer */}
                  <button
                    onClick={openInExplorer}
                    className="w-full px-4 py-2 text-left text-sm hover:bg-secondary flex items-center gap-2"
                  >
                    <ExternalLink className="size-4" />
                    Ver en explorador
                  </button>

                  {/* Switch account */}
                  <button
                    onClick={handleSwitchAccount}
                    disabled={isSwitching}
                    className="w-full px-4 py-2 text-left text-sm hover:bg-secondary flex items-center gap-2 disabled:opacity-50"
                  >
                    <RefreshCw className={`size-4 ${isSwitching ? 'animate-spin' : ''}`} />
                    {isSwitching ? 'Cambiando...' : 'Cambiar cuenta'}
                  </button>

                  {/* Disconnect */}
                  {onDisconnect && (
                    <button
                      onClick={() => {
                        setShowMenu(false);
                        onDisconnect();
                      }}
                      className="w-full px-4 py-2 text-left text-sm hover:bg-red-50 text-red-600 flex items-center gap-2"
                    >
                      <LogOut className="size-4" />
                      Desconectar wallet
                    </button>
                  )}

                  {/* Tip */}
                  <div className="px-4 py-2 border-t border-border">
                    <p className="text-xs text-muted-foreground">
                      💡 También puedes cambiar desde tu wallet y se actualizará automáticamente
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Click outside to close menu */}
      {showMenu && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowMenu(false)}
        />
      )}
    </header>
  );
}
