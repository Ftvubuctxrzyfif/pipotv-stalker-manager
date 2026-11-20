import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useQuery } from '@tanstack/react-query';
import db from '@/lib/shared/kliv-database';
import PortalManager from '@/components/PortalManager';
import PlayerView from '@/components/PlayerView';
import { StalkerPortal } from '@/lib/stalker-portal';
import { Tv, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Index = () => {
  const { toast } = useToast();
  
  // All hooks must be called in the same order
  const [activePortal, setActivePortal] = useState<StalkerPortal | null>(null);
  const [showManager, setShowManager] = useState(true);
  
  const { data: portals = [] } = useQuery<StalkerPortal[]>({
    queryKey: ['portals'],
    queryFn: async () => {
      const result = await db.query<StalkerPortal>('portals', {
        order: '_created_at.desc',
      });
      return result;
    },
  });

  useEffect(() => {
    // Find the active portal
    const active = portals.find((p: StalkerPortal) => p.is_active === 1);
    if (active) {
      setActivePortal(active);
      setShowManager(false);
    } else {
      setShowManager(true);
    }
  }, [portals]);

  const handlePortalSelect = (portal: StalkerPortal) => {
    setActivePortal(portal);
    setShowManager(false);
  };

  const handleBackToManager = () => {
    setShowManager(true);
  };

  const handleSignOut = () => {
    toast({
      title: 'Signed out',
      description: 'You have been signed out successfully.',
    });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-950/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-blue-600 p-2 rounded-lg">
                <Tv className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold">Kabayo IPTV</h1>
                <p className="text-xs text-gray-400">Stalker Portal Manager for LG WebOS TV</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {!showManager && activePortal && (
                <Button
                  variant="outline"
                  onClick={handleBackToManager}
                  className="bg-slate-900 border-slate-700"
                >
                  Manage Portals
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon"
                onClick={handleSignOut}
                className="text-gray-400 hover:text-white"
              >
                <LogOut className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        {showManager ? (
          <PortalManager activePortal={activePortal} onPortalSelect={handlePortalSelect} />
        ) : activePortal ? (
          <PlayerView portal={activePortal} />
        ) : (
          <div className="flex items-center justify-center h-64">
            <p className="text-gray-400">No portal selected. Please add a portal first.</p>
          </div>
        )}
      </main>

      {/* Footer Info */}
      <footer className="border-t border-slate-800 mt-8 py-6">
        <div className="container mx-auto px-6 text-center text-sm text-gray-500">
          <p>Kabayo IPTV • Optimized for LG WebOS TV</p>
          <p className="mt-1">Access from any device with a web browser</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
