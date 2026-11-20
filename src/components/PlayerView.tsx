import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { StalkerPortal, StalkerChannel, StalkerPortalClient } from '@/lib/stalker-portal';
import VideoPlayer from '@/components/VideoPlayer';
import ChannelList from '@/components/ChannelList';
import { Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface PlayerViewProps {
  portal: StalkerPortal;
}

const PlayerView = ({ portal }: PlayerViewProps) => {
  const { toast } = useToast();
  const [channels, setChannels] = useState<StalkerChannel[]>([]);
  const [selectedChannel, setSelectedChannel] = useState<StalkerChannel | null>(null);
  const [currentStreamUrl, setCurrentStreamUrl] = useState<string>('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  useEffect(() => {
    loadChannels();
  }, [portal]);

  const loadChannels = async () => {
    setIsLoading(true);
    setConnectionError(null);
    
    try {
      const client = new StalkerPortalClient(portal.mac_address, portal.host_url);
      
      // Test connection first
      const testResult = await client.testConnection();
      
      if (!testResult.success) {
        setConnectionError(testResult.message);
        toast({
          variant: 'destructive',
          title: 'Connection Failed',
          description: testResult.message,
        });
        setIsLoading(false);
        return;
      }

      // Authenticate and load channels
      await client.authenticate();
      const channelList = await client.getChannels();
      
      setChannels(channelList);
      
      toast({
        title: 'Channels loaded',
        description: `${channelList.length} channels available`,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to connect to portal';
      setConnectionError(errorMessage);
      toast({
        variant: 'destructive',
        title: 'Connection Error',
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChannelSelect = async (channel: StalkerChannel) => {
    setSelectedChannel(channel);
    setIsLoading(true);
    setConnectionError(null);

    try {
      const client = new StalkerPortalClient(portal.mac_address, portal.host_url);
      await client.authenticate();
      
      // Get the actual stream URL for this channel
      const streamUrl = await client.getStreamUrl(channel.id);
      
      setCurrentStreamUrl(streamUrl);
      setIsPlaying(true);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load stream';
      toast({
        variant: 'destructive',
        title: 'Stream Error',
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading && channels.length === 0) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-950">
        <div className="text-center">
          <Loader2 className="w-16 h-16 animate-spin text-blue-500 mx-auto mb-4" />
          <p className="text-white text-lg">Connecting to {portal.name}...</p>
          <p className="text-gray-400 text-sm mt-2">Authenticating with MAC: {portal.mac_address}</p>
        </div>
      </div>
    );
  }

  if (connectionError && channels.length === 0) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-950 p-8">
        <div className="max-w-md w-full">
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="ml-2">
              <p className="font-semibold">Connection Failed</p>
              <p className="text-sm mt-1">{connectionError}</p>
            </AlertDescription>
          </Alert>
          
          <div className="space-y-2 text-sm text-gray-400 mb-4">
            <p>Make sure:</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>MAC address is correct</li>
              <li>Portal URL is accessible</li>
              <li>Your subscription is active</li>
              <li>The portal supports Stalker middleware</li>
            </ul>
          </div>
          
          <Button onClick={loadChannels} className="w-full bg-blue-600 hover:bg-blue-700">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-slate-950 text-white">
      {/* Video Player Section */}
      <div className="flex-shrink-0 bg-black">
        {currentStreamUrl ? (
          <VideoPlayer streamUrl={currentStreamUrl} isPlaying={isPlaying} />
        ) : (
          <div className="aspect-video flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-950">
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-400 mb-2">PIPOTV-STALKER</p>
              <p className="text-gray-500">Select a channel to start watching</p>
            </div>
          </div>
        )}
      </div>

      {/* Channel List Section */}
      <div className="flex-1 overflow-hidden">
        {selectedChannel && (
          <div className="p-4 border-b border-slate-800 bg-slate-900">
            <p className="text-sm text-gray-400">Now Playing</p>
            <p className="text-lg font-semibold">{selectedChannel.name}</p>
          </div>
        )}
        
        <ChannelList
          channels={channels}
          selectedChannel={selectedChannel}
          onChannelSelect={handleChannelSelect}
          isLoading={false}
        />
      </div>
    </div>
  );
};

export default PlayerView;
