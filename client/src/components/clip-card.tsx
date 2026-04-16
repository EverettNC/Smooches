import { useState } from 'react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Heart, 
  MessageCircle, 
  Share2, 
  Play, 
  Pause
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useQuery } from '@tanstack/react-query';
import { getQueryFn } from '@/lib/queryClient';
import { type Clip, type User } from '@shared/schema';

interface ClipCardProps {
  clip: Clip;
}

export function ClipCard({ clip }: ClipCardProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const { toast } = useToast();
  const audioRef = useState<HTMLAudioElement | null>(null);

  // Fetch user info
  const { data: user } = useQuery({
    queryKey: ['/api/users', clip.userId],
    queryFn: getQueryFn<User>({ on401: 'returnNull' }),
  });

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handlePlayPause = () => {
    if (!audioRef[0]) {
      // Create audio element if it doesn't exist
      const audio = new Audio(clip.clipUrl);
      audioRef[0] = audio;
      
      audio.addEventListener('ended', () => {
        setIsPlaying(false);
      });

      audio.addEventListener('error', () => {
        toast({
          title: "Error",
          description: "Failed to play audio clip",
          variant: "destructive",
        });
        setIsPlaying(false);
      });
    }

    if (isPlaying) {
      audioRef[0].pause();
    } else {
      audioRef[0].play().catch(error => {
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

  const handleLike = () => {
    setIsLiked(!isLiked);
    // In a real app, you would call an API to record the like
  };

  const handleShare = () => {
    // In a real app, this would open a share dialog
    navigator.clipboard.writeText(window.location.origin + '/clips/' + clip.id)
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

  return (
    <Card className="overflow-hidden transition-all hover:shadow-md">
      <div 
        className="aspect-video bg-muted relative cursor-pointer"
        style={{
          backgroundImage: `url(${clip.thumbnailUrl})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
        onClick={handlePlayPause}
      >
        <div className="absolute inset-0 flex items-center justify-center bg-black/30 hover:bg-black/40 transition-colors">
          <Button 
            size="icon" 
            variant="ghost" 
            className="h-16 w-16 rounded-full bg-primary/80 text-primary-foreground hover:bg-primary/90"
          >
            {isPlaying ? (
              <Pause className="h-8 w-8" />
            ) : (
              <Play className="h-8 w-8 ml-1" />
            )}
          </Button>
        </div>
        
        <Badge 
          variant="secondary" 
          className="absolute bottom-2 right-2 bg-black/70 hover:bg-black/70"
        >
          {formatDuration(clip.duration)}
        </Badge>
      </div>
      
      <CardContent className="p-4">
        <h3 className="font-semibold text-lg truncate">{clip.title}</h3>
        <p className="text-sm text-muted-foreground truncate">
          From: {clip.showName}
        </p>
        
        <div className="flex items-center gap-2 mt-2">
          <Avatar className="h-6 w-6">
            <AvatarImage src={user?.avatar ?? undefined} />
            <AvatarFallback>{user?.displayName?.[0] || '?'}</AvatarFallback>
          </Avatar>
          <span className="text-sm font-medium">
            {user?.displayName || 'Unknown creator'}
          </span>
        </div>
      </CardContent>
      
      <CardFooter className="p-4 pt-0 flex justify-between">
        <Button 
          variant="ghost" 
          size="sm" 
          className="gap-1"
          onClick={handleLike}
        >
          <Heart className={`h-4 w-4 ${isLiked ? 'fill-red-500 text-red-500' : ''}`} />
          <span className="text-xs">{isLiked ? '1' : '0'}</span>
        </Button>
        
        <Button 
          variant="ghost" 
          size="sm" 
          className="gap-1"
        >
          <MessageCircle className="h-4 w-4" />
          <span className="text-xs">0</span>
        </Button>
        
        <Button 
          variant="ghost" 
          size="sm" 
          className="gap-1"
          onClick={handleShare}
        >
          <Share2 className="h-4 w-4" />
          <span className="text-xs">Share</span>
        </Button>
      </CardFooter>
    </Card>
  );
}