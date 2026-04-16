import { useState, useEffect } from 'react';
import { useParams, useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { getQueryFn } from '@/lib/queryClient';
import { type Clip, type User } from '@shared/schema';
import { Header } from '@/components/header';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Heart, 
  MessageCircle, 
  Share2, 
  Play, 
  Pause,
  ChevronLeft,
  CalendarDays
} from 'lucide-react';
import { ClipFeed } from '@/components/clip-feed';
import { formatDistanceToNow } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

export default function ClipPage() {
  const { id } = useParams();
  const [_, setLocation] = useLocation();
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);
  const { toast } = useToast();
  
  const clipId = parseInt(id ?? '0');

  const { data: clip, isLoading: isLoadingClip } = useQuery({
    queryKey: ['/api/clips', clipId],
    queryFn: getQueryFn<Clip>({ on401: 'returnNull' }),
    enabled: !isNaN(clipId),
  });

  const { data: user } = useQuery({
    queryKey: ['/api/users', clip?.userId],
    queryFn: getQueryFn<User>({ on401: 'returnNull' }),
    enabled: !!clip?.userId,
  });

  useEffect(() => {
    if (clip?.clipUrl && !audioElement) {
      const audio = new Audio(clip.clipUrl);
      audio.addEventListener('ended', () => {
        setIsPlaying(false);
      });
      setAudioElement(audio);
    }

    return () => {
      if (audioElement) {
        audioElement.pause();
        audioElement.src = '';
        setAudioElement(null);
      }
    };
  }, [clip, audioElement]);

  const handlePlayPause = () => {
    if (!audioElement) return;

    if (isPlaying) {
      audioElement.pause();
    } else {
      audioElement.play().catch(error => {
        console.error('Error playing audio:', error);
        toast({
          title: "Error",
          description: "Failed to play audio clip",
          variant: "destructive",
        });
      });
    }
    
    setIsPlaying(!isPlaying);
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href)
      .then(() => {
        toast({
          title: "Link copied",
          description: "Share link copied to clipboard!",
        });
      })
      .catch(() => {
        toast({
          title: "Error",
          description: "Failed to copy link",
          variant: "destructive",
        });
      });
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  if (isNaN(clipId)) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <h1 className="text-2xl font-bold">Invalid Clip ID</h1>
          <Button 
            variant="outline" 
            className="mt-4"
            onClick={() => setLocation('/clips')}
          >
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back to Clips
          </Button>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <Button 
          variant="outline" 
          className="mb-6"
          onClick={() => setLocation('/clips')}
        >
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back to Clips
        </Button>
        
        {isLoadingClip ? (
          <div className="space-y-6">
            <Skeleton className="h-[300px] md:h-[400px] w-full rounded-lg" />
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-6 w-1/2" />
            <div className="flex gap-3">
              <Skeleton className="h-12 w-12 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-4 w-32" />
              </div>
            </div>
          </div>
        ) : clip ? (
          <div className="space-y-6">
            <div className="relative rounded-lg overflow-hidden">
              <div 
                className="aspect-video md:aspect-[21/9] bg-muted"
                style={{
                  backgroundImage: `url(${clip.thumbnailUrl})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center'
                }}
              >
                <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                  <Button 
                    size="icon" 
                    variant="ghost" 
                    className="h-24 w-24 rounded-full bg-primary/80 text-primary-foreground hover:bg-primary/90"
                    onClick={handlePlayPause}
                  >
                    {isPlaying ? (
                      <Pause className="h-12 w-12" />
                    ) : (
                      <Play className="h-12 w-12 ml-1" />
                    )}
                  </Button>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <h1 className="text-3xl font-bold">{clip.title}</h1>
              
              <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <CalendarDays className="h-4 w-4" />
                  {clip.createdAt && formatDistanceToNow(new Date(clip.createdAt), { addSuffix: true })}
                </div>
                <div>•</div>
                <div>Duration: {formatDuration(clip.duration)}</div>
                <div>•</div>
                <div>From show: {clip.showName}</div>
              </div>
              
              <div className="flex gap-4">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="gap-2"
                >
                  <Heart className="h-4 w-4" />
                  Like
                </Button>
                
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="gap-2"
                >
                  <MessageCircle className="h-4 w-4" />
                  Comment
                </Button>
                
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="gap-2"
                  onClick={handleShare}
                >
                  <Share2 className="h-4 w-4" />
                  Share
                </Button>
              </div>
              
              {clip.description && (
                <Card className="p-4">
                  <p>{clip.description}</p>
                </Card>
              )}
              
              <div className="flex items-center gap-3 pt-4 border-t">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={user?.avatar ?? undefined} />
                  <AvatarFallback>{user?.displayName?.[0] || '?'}</AvatarFallback>
                </Avatar>
                
                <div>
                  <h3 className="font-semibold">{user?.displayName || 'Unknown creator'}</h3>
                  <p className="text-sm text-muted-foreground">
                    {user?.followers || 0} followers
                  </p>
                </div>
                
                <Button className="ml-auto" variant="outline">
                  Follow
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-12 border rounded-lg bg-muted/30">
            <h1 className="text-2xl font-bold">Clip Not Found</h1>
            <p className="text-muted-foreground mt-2">
              The clip you're looking for doesn't exist or has been removed.
            </p>
            <Button 
              className="mt-4"
              onClick={() => setLocation('/clips')}
            >
              Explore Other Clips
            </Button>
          </div>
        )}
        
        <div className="mt-12">
          <h2 className="text-2xl font-semibold mb-6">More Quick Previews</h2>
          <ClipFeed stationId={clip?.stationId ?? undefined} />
        </div>
      </main>
    </div>
  );
}