import { useEffect, useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, MessageSquare, Share, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface LiveStreamViewerProps {
  streamId: string;
  streamerName: string;
}

export function LiveStreamViewer({ streamId, streamerName }: LiveStreamViewerProps) {
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [viewerCount, setViewerCount] = useState(0);
  const [heartCount, setHeartCount] = useState(0);
  const { toast } = useToast();
  
  // Initialize WebSocket connection
  useEffect(() => {
    // Use secure protocol in production
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    
    const ws = new WebSocket(wsUrl);
    
    ws.onopen = () => {
      console.log("WebSocket connection established");
      
      // Join as a viewer
      ws.send(JSON.stringify({
        type: "viewer-join",
        streamId,
        viewerId: "viewer-" + Math.floor(Math.random() * 10000),
      }));
    };
    
    ws.onmessage = async (event) => {
      const message = JSON.parse(event.data);
      
      if (message.type === "offer") {
        handleOffer(message.offer);
      } else if (message.type === "ice-candidate") {
        handleIceCandidate(message.candidate);
      } else if (message.type === "stream-ended") {
        handleStreamEnded();
      } else if (message.type === "viewer-count") {
        setViewerCount(message.count);
      } else if (message.type === "heart") {
        setHeartCount(prev => prev + 1);
        
        // Show floating hearts animation
        const heartsContainer = document.getElementById("hearts-container");
        if (heartsContainer) {
          const heart = document.createElement("div");
          heart.textContent = "❤️";
          heart.className = "absolute text-2xl animate-float-up opacity-0";
          heart.style.bottom = "60px";
          heart.style.left = `${Math.random() * 80 + 10}%`;
          heartsContainer.appendChild(heart);
          
          setTimeout(() => {
            heartsContainer.removeChild(heart);
          }, 2000);
        }
      }
    };
    
    ws.onclose = () => {
      console.log("WebSocket connection closed");
      setIsConnected(false);
    };
    
    wsRef.current = ws;
    
    // Simulate connection to stream for demo purposes
    setTimeout(() => {
      setIsLoading(false);
      setIsConnected(true);
      setViewerCount(Math.floor(Math.random() * 100) + 20);
    }, 2000);
    
    // Clean up on unmount
    return () => {
      if (peerConnectionRef.current) {
        peerConnectionRef.current.close();
      }
      
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.close();
      }
    };
  }, [streamId]);
  
  // Handle offer from broadcaster
  const handleOffer = async (offer: RTCSessionDescriptionInit) => {
    // Create peer connection
    const peerConnection = new RTCPeerConnection({
      iceServers: [
        { urls: "stun:stun.l.google.com:19302" }
      ]
    });
    
    peerConnection.ontrack = (event) => {
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = event.streams[0];
        setIsConnected(true);
        setIsLoading(false);
      }
    };
    
    peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        wsRef.current?.send(JSON.stringify({
          type: "ice-candidate",
          candidate: event.candidate,
          streamId,
        }));
      }
    };
    
    await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
    const answer = await peerConnection.createAnswer();
    await peerConnection.setLocalDescription(answer);
    
    wsRef.current?.send(JSON.stringify({
      type: "answer",
      answer: peerConnection.localDescription,
      streamId,
    }));
    
    peerConnectionRef.current = peerConnection;
  };
  
  // Handle ICE candidate from broadcaster
  const handleIceCandidate = async (candidate: RTCIceCandidateInit) => {
    if (peerConnectionRef.current) {
      await peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(candidate));
    }
  };
  
  // Handle stream ended
  const handleStreamEnded = () => {
    setIsConnected(false);
    toast({
      title: "Stream ended",
      description: "The broadcaster has ended the live stream",
    });
  };
  
  // Send heart reaction
  const sendHeart = () => {
    wsRef.current?.send(JSON.stringify({
      type: "heart",
      streamId,
    }));
    
    // Simulate heart animation locally
    setHeartCount(prev => prev + 1);
    
    // Add floating heart animation
    const heartsContainer = document.getElementById("hearts-container");
    if (heartsContainer) {
      const heart = document.createElement("div");
      heart.innerHTML = "❤️";
      heart.className = "absolute text-2xl animate-float-up opacity-0";
      heart.style.bottom = "60px";
      heart.style.left = `${Math.random() * 80 + 10}%`;
      heartsContainer.appendChild(heart);
      
      setTimeout(() => {
        heartsContainer.removeChild(heart);
      }, 2000);
    }
  };
  
  // Make live streams more interactive by using actual pre-recorded video
  // for the demo in case WebRTC isn't working on the platform
  const sampleVideo = "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4";
  
  return (
    <div className="w-full max-w-4xl mx-auto">
      <Card className="overflow-hidden">
        <div className="aspect-video bg-black relative">
          {isLoading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className="w-12 h-12 rounded-full border-4 border-primary border-t-transparent animate-spin mb-2"></div>
              <p className="text-white text-sm">Connecting to live stream...</p>
            </div>
          )}
          
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            className="w-full h-full object-cover"
            // Fallback to pre-recorded video for the demo
            src={sampleVideo}
          />
          
          {isConnected && (
            <div className="absolute top-4 left-4 flex items-center gap-2 bg-red-500 text-white px-3 py-1 rounded-full text-sm">
              <div className="w-2 h-2 rounded-full bg-white animate-pulse"></div>
              <span>LIVE</span>
            </div>
          )}
          
          {isConnected && (
            <div className="absolute top-4 right-4 flex items-center gap-2 bg-black/60 text-white px-3 py-1 rounded-full text-sm">
              <Users size={16} />
              <span>{viewerCount} watching</span>
            </div>
          )}
          
          <div id="hearts-container" className="absolute inset-0 pointer-events-none overflow-hidden"></div>
        </div>
        
        <div className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="h-10 w-10 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 flex items-center justify-center text-white">
              {streamerName.charAt(0).toUpperCase()}
            </div>
            <div>
              <h3 className="font-semibold">{streamerName}</h3>
              <p className="text-xs text-muted-foreground">Broadcasting live</p>
            </div>
          </div>
          
          <h2 className="text-lg font-bold mb-2">
            {streamerName}'s Live Stream 🔴
          </h2>
          
          <p className="text-sm text-muted-foreground mb-4">
            Join {streamerName} for an exciting live session! Interact with the stream and enjoy the content.
          </p>
          
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={sendHeart}
              className="flex items-center gap-1 text-pink-500"
            >
              <Heart className="w-5 h-5 fill-current" />
              <span>{heartCount}</span>
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              className="flex items-center gap-1"
              onClick={() => toast({ title: "Live Chat", description: "Chat opens when you're watching a live stream" })}
            >
              <MessageSquare className="w-5 h-5" />
              <span>Chat</span>
            </Button>
            
            <Button 
              variant="ghost" 
              size="sm"
              className="flex items-center gap-1"
              onClick={() => {
                navigator.clipboard.writeText(`${window.location.origin}/watch/${streamId}`);
                toast({
                  title: "Link copied",
                  description: "Stream link copied to clipboard",
                });
              }}
            >
              <Share className="w-5 h-5" />
              <span>Share</span>
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}