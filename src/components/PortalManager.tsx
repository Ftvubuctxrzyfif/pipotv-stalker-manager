import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Pencil, Trash2, Tv, Check, X } from 'lucide-react';
import db from '@/lib/shared/kliv-database';
import { formatMACForDisplay, isValidMACAddress, StalkerPortal } from '@/lib/stalker-portal';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface PortalManagerProps {
  activePortal: StalkerPortal | null;
  onPortalSelect: (portal: StalkerPortal) => void;
}

const PortalManager = ({ activePortal, onPortalSelect }: PortalManagerProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingPortal, setEditingPortal] = useState<StalkerPortal | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    mac_address: '',
    host_url: '',
    portal_url: '',
    notes: '',
  });

  // Fetch portals from database
  const { data: portals = [], isLoading } = useQuery<StalkerPortal[]>({
    queryKey: ['portals'],
    queryFn: async () => {
      const result = await db.query<StalkerPortal>('portals', {
        order: '_created_at.desc',
      });
      return result;
    },
  });

  // Add portal mutation
  const addPortal = useMutation({
    mutationFn: async (data: typeof formData) => {
      // Validate MAC address format
      if (!isValidMACAddress(data.mac_address)) {
        throw new Error('Invalid MAC address format. Use format: XX:XX:XX:XX:XX:XX');
      }

      // Validate URL format
      try {
        new URL(data.host_url);
      } catch {
        throw new Error('Invalid host URL format');
      }

      const result = await db.insert('portals', {
        name: data.name,
        mac_address: data.mac_address.toUpperCase(),
        host_url: data.host_url,
        portal_url: data.portal_url || null,
        notes: data.notes || null,
        is_active: 0,
      });

      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['portals'] });
      setIsAddDialogOpen(false);
      setFormData({ name: '', mac_address: '', host_url: '', portal_url: '', notes: '' });
      toast({
        title: 'Portal added',
        description: 'Your Stalker Portal has been configured successfully.',
      });
    },
    onError: (error: Error) => {
      toast({
        variant: 'destructive',
        title: 'Failed to add portal',
        description: error.message,
      });
    },
  });

  // Update portal mutation
  const updatePortal = useMutation({
    mutationFn: async ({ _row_id, ...data }: StalkerPortal & { _row_id: number }) => {
      if (!isValidMACAddress(data.mac_address)) {
        throw new Error('Invalid MAC address format');
      }

      try {
        new URL(data.host_url);
      } catch {
        throw new Error('Invalid host URL format');
      }

      const result = await db.update(
        'portals',
        { _row_id: `eq.${_row_id}` },
        {
          name: data.name,
          mac_address: data.mac_address.toUpperCase(),
          host_url: data.host_url,
          portal_url: data.portal_url || null,
          notes: data.notes || null,
        }
      );

      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['portals'] });
      setEditingPortal(null);
      setFormData({ name: '', mac_address: '', host_url: '', portal_url: '', notes: '' });
      toast({
        title: 'Portal updated',
        description: 'Your portal configuration has been updated.',
      });
    },
    onError: (error: Error) => {
      toast({
        variant: 'destructive',
        title: 'Failed to update portal',
        description: error.message,
      });
    },
  });

  // Delete portal mutation
  const deletePortal = useMutation({
    mutationFn: async (_row_id: number) => {
      await db.delete('portals', { _row_id: `eq.${_row_id}` });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['portals'] });
      toast({
        title: 'Portal deleted',
        description: 'The portal has been removed.',
      });
    },
  });

  const handleSubmit = () => {
    if (!formData.name || !formData.mac_address || !formData.host_url) {
      toast({
        variant: 'destructive',
        title: 'Missing required fields',
        description: 'Please fill in name, MAC address, and host URL.',
      });
      return;
    }

    if (editingPortal) {
      updatePortal.mutate({ ...formData, _row_id: editingPortal._row_id! });
    } else {
      addPortal.mutate(formData);
    }
  };

  const handleEdit = (portal: StalkerPortal) => {
    setEditingPortal(portal);
    setFormData({
      name: portal.name,
      mac_address: portal.mac_address,
      host_url: portal.host_url,
      portal_url: portal.portal_url || '',
      notes: portal.notes || '',
    });
  };

  const handleDelete = (_row_id: number) => {
    if (confirm('Are you sure you want to delete this portal?')) {
      deletePortal.mutate(_row_id);
    }
  };

  const handleActivate = async (portal: StalkerPortal) => {
    // Update active portal in database
    await db.update(
      'portals',
      { is_active: 'eq.1' }, // Find currently active
      { is_active: 0 } // Deactivate all
    );
    
    await db.update(
      'portals',
      { _row_id: `eq.${portal._row_id}` },
      { is_active: 1, last_used: new Date().toISOString() }
    );

    queryClient.invalidateQueries({ queryKey: ['portals'] });
    onPortalSelect(portal);
    
    toast({
      title: 'Portal activated',
      description: `Now using ${portal.name}`,
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-gray-400">Loading portals...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">My Portals</h2>
          <p className="text-gray-400">Manage your Stalker Portal configurations</p>
        </div>
        
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Add Portal
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-slate-900 border-slate-800 text-white">
            <DialogHeader>
              <DialogTitle>Add New Portal</DialogTitle>
              <DialogDescription className="text-gray-400">
                Configure your Stalker Portal with MAC address and host information
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 mt-4">
              <div>
                <Label htmlFor="name">Portal Name *</Label>
                <Input
                  id="name"
                  placeholder="My IPTV Service"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="bg-slate-800 border-slate-700"
                />
              </div>
              
              <div>
                <Label htmlFor="mac">MAC Address *</Label>
                <Input
                  id="mac"
                  placeholder="00:1A:79:XX:XX:XX"
                  value={formData.mac_address}
                  onChange={(e) => setFormData({ ...formData, mac_address: e.target.value })}
                  className="bg-slate-800 border-slate-700"
                  maxLength={17}
                />
                <p className="text-xs text-gray-500 mt-1">Format: XX:XX:XX:XX:XX:XX</p>
              </div>
              
              <div>
                <Label htmlFor="host">Host URL *</Label>
                <Input
                  id="host"
                  placeholder="http://your-portal.com"
                  value={formData.host_url}
                  onChange={(e) => setFormData({ ...formData, host_url: e.target.value })}
                  className="bg-slate-800 border-slate-700"
                />
              </div>
              
              <div>
                <Label htmlFor="portal">Portal URL (Optional)</Label>
                <Input
                  id="portal"
                  placeholder="/portal.php"
                  value={formData.portal_url}
                  onChange={(e) => setFormData({ ...formData, portal_url: e.target.value })}
                  className="bg-slate-800 border-slate-700"
                />
              </div>
              
              <div>
                <Label htmlFor="notes">Notes</Label>
                <Input
                  id="notes"
                  placeholder="Provider, subscription info, etc."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="bg-slate-800 border-slate-700"
                />
              </div>
              
              <div className="flex gap-2 justify-end">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsAddDialogOpen(false);
                    setFormData({ name: '', mac_address: '', host_url: '', portal_url: '', notes: '' });
                  }}
                  className="bg-slate-800 border-slate-700"
                >
                  Cancel
                </Button>
                <Button onClick={handleSubmit} className="bg-blue-600 hover:bg-blue-700">
                  Save Portal
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {portals.length === 0 ? (
        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="py-12">
            <div className="text-center">
              <Tv className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">No portals configured</h3>
              <p className="text-gray-400 mb-6">Add your first Stalker Portal to get started</p>
              <Button onClick={() => setIsAddDialogOpen(true)} className="bg-blue-600 hover:bg-blue-700">
                <Plus className="w-4 h-4 mr-2" />
                Add Your First Portal
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {portals.map((portal: StalkerPortal) => (
            <Card
              key={portal._row_id}
              className={`bg-slate-900 border-slate-800 ${
                activePortal?._row_id === portal._row_id ? 'ring-2 ring-blue-500' : ''
              }`}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-white flex items-center gap-2">
                      {portal.name}
                      {activePortal?._row_id === portal._row_id && (
                        <span className="px-2 py-0.5 bg-blue-600 text-white text-xs rounded-full">Active</span>
                      )}
                    </CardTitle>
                    <CardDescription className="text-gray-400 mt-1">
                      MAC: {formatMACForDisplay(portal.mac_address)}
                    </CardDescription>
                  </div>
                  
                  <div className="flex gap-2">
                    {activePortal?._row_id !== portal._row_id && (
                      <Button
                        size="sm"
                        onClick={() => handleActivate(portal)}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <Check className="w-4 h-4" />
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(portal)}
                      className="bg-slate-800 border-slate-700"
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDelete(portal._row_id!)}
                      className="bg-slate-800 border-slate-700 hover:bg-red-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Host:</span>
                    <span className="text-white font-mono text-xs">{portal.host_url}</span>
                  </div>
                  {portal.portal_url && (
                    <div className="flex justify-between">
                      <span className="text-gray-400">Portal:</span>
                      <span className="text-white font-mono text-xs">{portal.portal_url}</span>
                    </div>
                  )}
                  {portal.notes && (
                    <div className="flex justify-between">
                      <span className="text-gray-400">Notes:</span>
                      <span className="text-white">{portal.notes}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Edit Dialog */}
      {editingPortal && (
        <Dialog open={!!editingPortal} onOpenChange={() => setEditingPortal(null)}>
          <DialogContent className="bg-slate-900 border-slate-800 text-white">
            <DialogHeader>
              <DialogTitle>Edit Portal</DialogTitle>
              <DialogDescription className="text-gray-400">
                Update your Stalker Portal configuration
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 mt-4">
              <div>
                <Label htmlFor="edit-name">Portal Name *</Label>
                <Input
                  id="edit-name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="bg-slate-800 border-slate-700"
                />
              </div>
              
              <div>
                <Label htmlFor="edit-mac">MAC Address *</Label>
                <Input
                  id="edit-mac"
                  value={formData.mac_address}
                  onChange={(e) => setFormData({ ...formData, mac_address: e.target.value })}
                  className="bg-slate-800 border-slate-700"
                  maxLength={17}
                />
              </div>
              
              <div>
                <Label htmlFor="edit-host">Host URL *</Label>
                <Input
                  id="edit-host"
                  value={formData.host_url}
                  onChange={(e) => setFormData({ ...formData, host_url: e.target.value })}
                  className="bg-slate-800 border-slate-700"
                />
              </div>
              
              <div>
                <Label htmlFor="edit-portal">Portal URL (Optional)</Label>
                <Input
                  id="edit-portal"
                  value={formData.portal_url}
                  onChange={(e) => setFormData({ ...formData, portal_url: e.target.value })}
                  className="bg-slate-800 border-slate-700"
                />
              </div>
              
              <div>
                <Label htmlFor="edit-notes">Notes</Label>
                <Input
                  id="edit-notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="bg-slate-800 border-slate-700"
                />
              </div>
              
              <div className="flex gap-2 justify-end">
                <Button
                  variant="outline"
                  onClick={() => {
                    setEditingPortal(null);
                    setFormData({ name: '', mac_address: '', host_url: '', portal_url: '', notes: '' });
                  }}
                  className="bg-slate-800 border-slate-700"
                >
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
                <Button onClick={handleSubmit} className="bg-blue-600 hover:bg-blue-700">
                  Update Portal
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default PortalManager;
