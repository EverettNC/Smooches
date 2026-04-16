import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getQueryFn } from '@/lib/queryClient';
import { type Clip } from '@shared/schema';
import { ClipCard } from '@/components/clip-card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';

interface ClipFeedProps {
  userId?: number;
  stationId?: number;
}

export function ClipFeed({ userId, stationId }: ClipFeedProps) {
  const [activeTab, setActiveTab] = useState<'trending' | 'latest'>('trending');
  const { toast } = useToast();

  // Determine query endpoint based on props
  let queryKey: Array<string | number> = ['/api/clips'];
  if (userId) {
    queryKey = ['/api/users', userId.toString(), 'clips'];
  } else if (stationId) {
    queryKey = ['/api/radio-stations', stationId.toString(), 'clips'];
  }

  const { 
    data: clips, 
    isLoading, 
    isError, 
    error 
  } = useQuery({
    queryKey,
    queryFn: getQueryFn<Clip[]>({ on401: 'returnNull' }),
  });

  if (isError) {
    toast({
      title: "Error",
      description: "Failed to load clips. Please try again.",
      variant: "destructive",
    });
  }

  const sortedClips = clips 
    ? [...clips].sort((a, b) => {
        if (activeTab === 'trending') {
          // In a real app, trending would be based on engagement metrics
          return b.id - a.id; // For now, assume newer clips are trending
        } else {
          // Sort by creation date (newest first)
          const dateA = a.createdAt ? new Date(a.createdAt) : new Date(0);
          const dateB = b.createdAt ? new Date(b.createdAt) : new Date(0);
          return dateB.getTime() - dateA.getTime();
        }
      })
    : [];

  return (
    <div className="w-full space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Quick Preview Magic</h2>
        
        <Tabs value={activeTab} onValueChange={(value: string) => setActiveTab(value as 'trending' | 'latest')}>
          <TabsList>
            <TabsTrigger value="trending">Trending</TabsTrigger>
            <TabsTrigger value="latest">Latest</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array(6).fill(null).map((_, index) => (
            <div key={index} className="space-y-3">
              <Skeleton className="h-[200px] w-full rounded-lg" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <div className="flex gap-2">
                <Skeleton className="h-8 w-8 rounded-full" />
                <Skeleton className="h-4 w-1/3 mt-2" />
              </div>
            </div>
          ))}
        </div>
      ) : sortedClips.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedClips.map((clip) => (
            <ClipCard key={clip.id} clip={clip} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 border rounded-lg bg-muted/30">
          <h3 className="text-xl font-semibold">No clips found</h3>
          <p className="text-muted-foreground mt-2">
            {userId 
              ? "This user hasn't created any clips yet."
              : stationId
                ? "This station doesn't have any clips yet."
                : "There are no clips available yet."}
          </p>
          {!userId && !stationId && (
            <Button className="mt-4">
              Create Your First Clip
            </Button>
          )}
        </div>
      )}
    </div>
  );
}