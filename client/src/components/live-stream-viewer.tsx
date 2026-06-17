import { useEffect, useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, MessageSquare, Share, Users, Gift } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface LiveStreamViewerProps {
  streamId: string;
  streamerName: string;
}

export function LiveStreamViewer({ streamId, streamerName }: LiveStreamViewerProps) {
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const viewerIdRef = useRef<string>(`viewer-${Date.now()}-${Math.floor(Math.random() * 10000)}`);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [viewerCount, setViewerCount] = useState(0);
  const [heartCount, setHeartCount] = useState(0);
  const [showGiftPanel, setShowGiftPanel] = useState(false);
  const { toast } = useToast();

  const giftOptions = [
    { id: 1, name: "Rose", icon: "🌹", price: 5 },
    { id: 2, name: "Crown", icon: "👑", price: 20 },
    { id: 3, name: "Diamond", icon: "💎", price: 50 }
  ];
  
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
        viewerId: viewerIdRef.current,
      }));
    };
    
    ws.onmessage = async (event) => {
      const message = JSON.parse(event.data);
      
      if (message.type === "broadcaster-ready") {
        // re-join so broadcaster gets viewer-connected
        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
          wsRef.current.send(JSON.stringify({
            type: "viewer-join",
            streamId,
            viewerId: viewerIdRef.current,
          }));
        }
      } else if (message.type === "offer") {
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
      } else if (message.type === "gift") {
        const heartsContainer = document.getElementById("hearts-container");
        if (heartsContainer) {
          const g = document.createElement("div");
          g.textContent = message.icon || "🎁";
          g.className = "absolute text-3xl";
          g.style.bottom = "60px";
          g.style.left = `${Math.random() * 80 + 10}%`;
          g.style.zIndex = "20";
          heartsContainer.appendChild(g);
          
          setTimeout(() => {
            if (g.parentNode) g.parentNode.removeChild(g);
          }, 3000);
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
          viewerId: viewerIdRef.current,
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
      viewerId: viewerIdRef.current,
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

  const sendGift = async (giftId: number) => {
    const giftOption = giftOptions.find(g => g.id === giftId);
    if (!giftOption) return;
    try {
      await apiRequest('POST', '/api/transactions', {
        amount: String(giftOption.price),
        type: 'gift',
        status: 'completed'
      });
      toast({ title: "Gift sent!", description: `$${giftOption.price} — 85% to creator` });
    } catch {}
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: "gift",
        streamId,
        icon: giftOption.icon,
        amount: giftOption.price
      }));
    }
    setShowGiftPanel(false);
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
              onClick={() => setShowGiftPanel(!showGiftPanel)}
              className="flex items-center gap-1"
            >
              <Gift className="w-5 h-5" />
              <span>Gift</span>
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

          {showGiftPanel && (
            <div className="mt-3 p-2 bg-black/60 rounded grid grid-cols-3 gap-2">
              {giftOptions.map(g => (
                <Button key={g.id} variant="outline" size="sm" className="flex flex-col h-auto py-1 text-xs border-white/30" onClick={() => sendGift(g.id)}>
                  <span className="text-lg">{g.icon}</span>
                  <span>${g.price}</span>
                </Button>
              ))}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}