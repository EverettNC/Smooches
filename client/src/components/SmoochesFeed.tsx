// SmoochesFeed.js – Video Feed Component for Smooches

import React, { useState, useEffect } from "react";
import { Heart, MessageSquare, Share } from "lucide-react";

// Sample video data with local videos to ensure they always work
const SAMPLE_VIDEOS = [
  { 
    id: 1, 
    user: "Kiki", 
    url: "/short-audio.mp3", 
    fallbackUrl: "https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4",
    caption: "🔥 Morning vibes!", 
    likes: 423,
    comments: 89
  },
  { 
    id: 2, 
    user: "Lash", 
    url: "/short-audio.mp3", 
    fallbackUrl: "https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4",
    caption: "Manifesting chaos 💅", 
    likes: 2182,
    comments: 305
  },
  { 
    id: 3, 
    user: "Big Tank", 
    url: "/short-audio.mp3", 
    fallbackUrl: "https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4",
    caption: "Late-night rants incoming.", 
    likes: 761,
    comments: 128
  },
];

export default function SmoochesFeed() {
  const [videos, setVideos] = useState(SAMPLE_VIDEOS);
  const [activeVideo, setActiveVideo] = useState<number | null>(null);
  const [likedVideos, setLikedVideos] = useState<number[]>([]);

  // Format numbers for display (e.g., 1.2k instead of 1200)
  const formatCount = (count: number) => {
    if (count >= 1000000) {
      return (count / 1000000).toFixed(1) + 'M';
    } else if (count >= 1000) {
      return (count / 1000).toFixed(1) + 'K';
    }
    return count.toString();
  };

  // Handle video play events
  const handleVideoPlay = (videoId: number) => {
    setActiveVideo(videoId);
  };

  // Handle like button click
  const handleLike = (videoId: number) => {
    if (likedVideos.includes(videoId)) {
      setLikedVideos(likedVideos.filter(id => id !== videoId));
      setVideos(videos.map(video => 
        video.id === videoId ? { ...video, likes: video.likes - 1 } : video
      ));
    } else {
      setLikedVideos([...likedVideos, videoId]);
      setVideos(videos.map(video => 
        video.id === videoId ? { ...video, likes: video.likes + 1 } : video
      ));
    }
  };

  return (
    <div className="flex flex-col gap-8 p-4 max-w-3xl mx-auto pb-20">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-pink-500 to-purple-600 text-transparent bg-clip-text">Smooches Feed</h1>
        <div className="flex gap-2">
          <button className="px-3 py-1 bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200 rounded-full text-sm font-medium">For You</button>
          <button className="px-3 py-1 bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200 rounded-full text-sm font-medium">Following</button>
        </div>
      </div>
      
      {videos.map((vid) => (
        <div key={vid.id} className="bg-card rounded-xl shadow-lg border border-border/40 overflow-hidden transition-all duration-200 hover:shadow-xl">
          <div className="relative">
            <video
              className="w-full rounded-t-xl h-[540px] object-cover bg-black"
              src={vid.url}
              poster="https://placehold.co/600x400/black/white?text=Loading+Video..."
              controls
              loop
              onPlay={() => handleVideoPlay(vid.id)}
              onError={(e) => {
                console.log("Error loading video, trying fallback");
                // @ts-ignore - Setting src directly on error
                e.currentTarget.src = vid.fallbackUrl;
              }}
            />
            
            {/* Floating engagement buttons */}
            <div className="absolute right-4 bottom-4 flex flex-col gap-4">
              <button 
                onClick={() => handleLike(vid.id)}
                className={`flex flex-col items-center ${likedVideos.includes(vid.id) ? 'text-pink-500' : 'text-white'}`}
              >
                <div className="w-10 h-10 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center">
                  <Heart className={`w-5 h-5 ${likedVideos.includes(vid.id) ? 'fill-current' : ''}`} />
                </div>
                <span className="text-xs mt-1">{formatCount(vid.likes)}</span>
              </button>
              
              <button className="flex flex-col items-center text-white">
                <div className="w-10 h-10 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <span className="text-xs mt-1">{formatCount(vid.comments)}</span>
              </button>
              
              <button className="flex flex-col items-center text-white">
                <div className="w-10 h-10 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center">
                  <Share className="w-5 h-5" />
                </div>
                <span className="text-xs mt-1">Share</span>
              </button>
            </div>
          </div>
          
          <div className="p-4">
            <div className="flex items-start gap-3">
              <div className="h-12 w-12 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg shrink-0">
                {vid.user.charAt(0)}
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <strong className="text-lg">@{vid.user}</strong>
                  <span className="text-xs bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200 px-2 py-0.5 rounded-full">Creator</span>
                </div>
                <p className="text-muted-foreground">{vid.caption}</p>
                <div className="mt-2 text-xs text-muted-foreground">
                  Posted 3 hours ago
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}