import { useEffect, useRef, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

interface VideoPlayerProps {
  streamUrl: string;
  isPlaying: boolean;
}

const VideoPlayer = ({ streamUrl, isPlaying }: VideoPlayerProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const loadStream = async () => {
      setIsLoading(true);
      setHasError(false);

      try {
        // Check if HLS.js is needed (not Safari)
        const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
        
        if (!isSafari && streamUrl.includes('.m3u8')) {
          // Use HLS.js for non-Safari browsers
          const Hls = (await import('hls.js')).default;
          
          if (Hls.isSupported()) {
            const hls = new Hls({
              enableWorker: true,
              lowLatencyMode: true,
            });

            hls.loadSource(streamUrl);
            hls.attachMedia(video);

            hls.on(Hls.Events.MANIFEST_PARSED, () => {
              setIsLoading(false);
              if (isPlaying) {
                video.play().catch(console.error);
              }
            });

            hls.on(Hls.Events.ERROR, (_event, data) => {
              console.error('HLS error:', data);
              if (data.fatal) {
                setHasError(true);
                setIsLoading(false);
                toast({
                  variant: 'destructive',
                  title: 'Stream Error',
                  description: 'Failed to load stream. Please try again.',
                });
              }
            });

            return () => {
              hls.destroy();
            };
          }
        }
        
        // Native HLS support (Safari) or direct streams
        video.src = streamUrl;
        
        video.addEventListener('canplay', () => {
          setIsLoading(false);
          if (isPlaying) {
            video.play().catch(console.error);
          }
        });

        video.addEventListener('error', () => {
          setHasError(true);
          setIsLoading(false);
          toast({
            variant: 'destructive',
            title: 'Stream Error',
            description: 'Failed to load video stream.',
          });
        });
      } catch (error) {
        console.error('Error loading stream:', error);
        setHasError(true);
        setIsLoading(false);
      }
    };

    if (streamUrl) {
      loadStream();
    }

    return () => {
      if (video) {
        video.pause();
        video.removeAttribute('src');
        video.load();
      }
    };
  }, [streamUrl, isPlaying, toast]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying && !isLoading && !hasError) {
      video.play().catch(console.error);
    } else {
      video.pause();
    }
  }, [isPlaying, isLoading, hasError]);

  return (
    <div className="relative w-full aspect-video bg-black rounded-lg overflow-hidden">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-10">
          <div className="text-center">
            <Loader2 className="w-16 h-16 animate-spin text-blue-500 mx-auto mb-4" />
            <p className="text-white text-lg">Loading stream...</p>
          </div>
        </div>
      )}
      
      {hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-10">
          <div className="text-center text-white">
            <p className="text-xl mb-2">Stream unavailable</p>
            <p className="text-sm text-gray-400">Please try another channel or check your portal connection</p>
          </div>
        </div>
      )}

      <video
        ref={videoRef}
        className="w-full h-full"
        controls
        playsInline
        autoPlay={isPlaying}
      />
    </div>
  );
};

export default VideoPlayer;
