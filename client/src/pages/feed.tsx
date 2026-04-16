import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Heart, MessageSquare, Share, ThumbsUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface VideoItem {
  id: number;
  user: string;
  url: string;
  caption: string;
  likes: number;
  comments: number;
}

export default function FeedPage() {
  const { toast } = useToast();

  // Sample videos with working URLs
  const [videos, setVideos] = useState<VideoItem[]>([
    { 
      id: 1, 
      user: "Kiki", 
      url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4", 
      caption: "🔥 Morning vibes! Just sharing this amazing content I found #morning #vibes",
      likes: 423,
      comments: 89
    },
    { 
      id: 2, 
      user: "Lash", 
      url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4", 
      caption: "Manifesting chaos 💅 Just another day in paradise #manifesting #chaos",
      likes: 891,
      comments: 213
    },
    { 
      id: 3, 
      user: "Big Tank", 
      url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4", 
      caption: "Late-night rants incoming. I had to get this off my chest #latenight #thoughts",
      likes: 562,
      comments: 124
    },
  ]);
  
  const [likedVideos, setLikedVideos] = useState<number[]>([]);
  
  // Toggle like for a video
  const toggleLike = (videoId: number) => {
    if (likedVideos.includes(videoId)) {
      setLikedVideos(likedVideos.filter(id => id !== videoId));
      setVideos(videos.map(video => 
        video.id === videoId ? {...video, likes: video.likes - 1} : video
      ));
    } else {
      setLikedVideos([...likedVideos, videoId]);
      setVideos(videos.map(video => 
        video.id === videoId ? {...video, likes: video.likes + 1} : video
      ));
    }
  };
  
  // Format number with K for thousands
  const formatCount = (count: number) => {
    return count >= 1000 ? `${(count / 1000).toFixed(1)}K` : count.toString();
  };
  
  return (
    <div className="p-6 space-y-6 max-w-xl mx-auto pb-20">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">🎥 Video Feed</h2>
        <div className="flex gap-2">
          <button className="px-3 py-1 text-sm bg-primary text-white rounded-full">For You</button>
          <button className="px-3 py-1 text-sm bg-gray-200 text-gray-800 rounded-full">Following</button>
        </div>
      </div>
      
      {videos.map((video) => (
        <Card key={video.id} className="overflow-hidden">
          <video
            className="w-full h-[540px] object-cover bg-black"
            src={video.url}
            controls
            loop
            poster={`https://picsum.photos/seed/${video.id}/600/800`}
          />
          
          <div className="p-4">
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 rounded-full bg-gradient-to-r from-pink-500 to-violet-500 flex items-center justify-center text-white font-bold shrink-0">
                {video.user.charAt(0)}
              </div>
              
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold">@{video.user}</span>
                  <span className="text-xs bg-gray-100 px-2 py-0.5 rounded-full text-gray-700">Creator</span>
                </div>
                
                <p className="text-gray-700 mt-1 text-sm">{video.caption}</p>
                
                <div className="flex gap-4 mt-3">
                  <button 
                    className={`flex items-center gap-1 text-sm ${likedVideos.includes(video.id) ? 'text-pink-500' : 'text-gray-500'}`}
                    onClick={() => toggleLike(video.id)}
                  >
                    <Heart className={`w-5 h-5 ${likedVideos.includes(video.id) ? 'fill-current' : ''}`} />
                    <span>{formatCount(video.likes)}</span>
                  </button>
                  
                  <button
                    className="flex items-center gap-1 text-sm text-gray-500"
                    onClick={() => toast({ title: "Comments", description: `${formatCount(video.comments)} comments on this video` })}
                  >
                    <MessageSquare className="w-5 h-5" />
                    <span>{formatCount(video.comments)}</span>
                  </button>

                  <button
                    className="flex items-center gap-1 text-sm text-gray-500"
                    onClick={() => {
                      navigator.clipboard.writeText(window.location.origin + '/feed');
                      toast({ title: "Link copied", description: "Video link copied to clipboard!" });
                    }}
                  >
                    <Share className="w-5 h-5" />
                    <span>Share</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}