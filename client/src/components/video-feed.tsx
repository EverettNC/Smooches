import { useQuery } from "@tanstack/react-query";
import { VideoPlayer } from "./video-player";
import type { Video } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";
import { useRef, useState, useEffect } from "react";
import { ChevronDown, RefreshCw, Video as VideoIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";

export function VideoFeed() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [, setLocation] = useLocation();
  
  const [page, setPage] = useState(1);
  const { data: apiVideos, isLoading, refetch } = useQuery<Video[]>({
    queryKey: ["/api/videos", page],
  });
  
  // The Feed is now 100% live. No mock data.
  const videos = apiVideos || [];

  const handleScroll = () => {
    if (containerRef.current) {
      const containerHeight = containerRef.current.clientHeight;
      const scrollTop = containerRef.current.scrollTop;
      const newIndex = Math.round(scrollTop / containerHeight);
      
      if (newIndex !== currentIndex) {
        setCurrentIndex(newIndex);
        
        // Load more content when approaching the end
        if (newIndex > videos.length - 3) {
          setPage(prev => prev + 1);
        }
      }
    }
  };
  
  const scrollToNext = () => {
    if (containerRef.current && currentIndex < videos.length - 1) {
      const nextIndex = currentIndex + 1;
      containerRef.current.scrollTo({
        top: nextIndex * containerRef.current.clientHeight,
        behavior: 'smooth'
      });
      setCurrentIndex(nextIndex);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setIsRefreshing(false);
    
    // Scroll back to top
    if (containerRef.current && videos.length > 0) {
      containerRef.current.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
      setCurrentIndex(0);
    }
  };

  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
      return () => {
        container.removeEventListener('scroll', handleScroll);
      };
    }
  }, [currentIndex, videos.length]);

  if (isLoading && videos.length === 0) {
    return (
      <div className="space-y-4 p-4">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="w-full h-[80vh] max-w-3xl mx-auto rounded-xl bg-gray-800" />
        ))}
      </div>
    );
  }

  // Safety Net: What happens if the live database has 0 videos
  if (!isLoading && videos.length === 0) {
    return (
      <div className="h-[calc(100vh-4rem)] bg-black flex flex-col items-center justify-center p-4">
        <div className="w-24 h-24 bg-gray-900 rounded-full flex items-center justify-center mb-6">
          <VideoIcon className="w-12 h-12 text-white/40" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">The feed is empty</h2>
        <p className="text-white/50 text-center mb-8 max-w-md">
          There are no videos in the database yet. Be the first creator to drop content on Smooches and start earning.
        </p>
        <Button 
          onClick={() => setLocation("/create")}
          className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 px-8 py-6 text-lg"
        >
          Upload a Video
        </Button>
      </div>
    );
  }

  return (
    <div className="relative h-[calc(100vh-4rem)] bg-black">
      {/* Refresh button */}
      <Button 
        variant="ghost" 
        size="icon" 
        className="absolute top-4 right-4 z-50 rounded-full bg-black/40 backdrop-blur-md text-white hover:bg-white/20"
        onClick={handleRefresh}
      >
        <RefreshCw className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`} />
      </Button>
      
      <div 
        ref={containerRef}
        className="h-full overflow-y-auto snap-y snap-mandatory scroll-smooth scrollbar-hide"
      >
        {videos.map((video, index) => (
          <div
            key={video.id}
            className="snap-start h-full w-full flex flex-col items-center justify-center"
          >
            <VideoPlayer 
              video={video} 
              autoPlay={index === currentIndex} 
            />
          </div>
        ))}
      </div>
      
      {/* Down arrow navigation */}
      {currentIndex < videos.length - 1 && (
        <Button 
          variant="ghost" 
          size="icon" 
          className="absolute bottom-4 left-1/2 -translate-x-1/2 z-50 rounded-full bg-black/40 backdrop-blur-md text-white hover:bg-white/20 animate-bounce"
          onClick={scrollToNext}
        >
          <ChevronDown className="w-5 h-5" />
        </Button>
      )}
    </div>
  );
}
