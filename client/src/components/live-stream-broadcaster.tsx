import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Mic, MicOff, Video, VideoOff, Share, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function LiveStreamBroadcaster() {
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [viewerCount, setViewerCount] = useState(0);
  const [peerConnections, setPeerConnections] = useState<RTCPeerConnection[]>([]);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const { toast } = useToast();

  // WebSocket for signaling
  const wsRef = useRef<WebSocket | null>(null);

  // Initialize WebSocket connection
  useEffect(() => {
    // Use secure protocol in production
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    
    const ws = new WebSocket(wsUrl);
    
    ws.onopen = () => {
      // Connection established
    };
    
    ws.onmessage = async (event) => {
      const message = JSON.parse(event.data);
      
      if (message.type === "viewer-connected") {
        // Handle new viewer connection
        setViewerCount(prev => prev + 1);
        
        // Create a new peer connection for this viewer
        if (mediaStreamRef.current) {
          const peerConnection = createPeerConnection(message.viewerId);
          
          // Add tracks from local stream to peer connection
          mediaStreamRef.current.getTracks().forEach(track => {
            peerConnection.addTrack(track, mediaStreamRef.current!);
          });
          
          // Create and send an offer
          const offer = await peerConnection.createOffer();
          await peerConnection.setLocalDescription(offer);
          
          ws.send(JSON.stringify({
            type: "offer",
            offer: peerConnection.localDescription,
            viewerId: message.viewerId,
          }));
          
          // Add to peer connections list
          setPeerConnections(prev => [...prev, peerConnection]);
        }
      } else if (message.type === "answer") {
        // Handle answer from viewer
        const peerConnection = connectionMap.current.get(message.viewerId);
        
        if (peerConnection) {
          const answer = new RTCSessionDescription(message.answer);
          await peerConnection.setRemoteDescription(answer);
        }
      } else if (message.type === "ice-candidate") {
        // Handle ICE candidate from viewer
        const peerConnection = connectionMap.current.get(message.viewerId);
        
        if (peerConnection) {
          const candidate = new RTCIceCandidate(message.candidate);
          await peerConnection.addIceCandidate(candidate);
        }
      } else if (message.type === "viewer-disconnected") {
        // Handle viewer disconnection
        setViewerCount(prev => Math.max(0, prev - 1));
        
        // Close and remove peer connection
        const peerConnection = connectionMap.current.get(message.viewerId);
        if (peerConnection) {
          peerConnection.close();
          connectionMap.current.delete(message.viewerId);
        }
        
        // Update peer connections state
        setPeerConnections(peerConnections.filter(pc => 
          !connectionMap.current.has(message.viewerId) || pc !== peerConnection
        ));
      }
    };
    
    ws.onclose = () => {
      // Connection closed
    };
    
    wsRef.current = ws;
    
    // Clean up on unmount
    return () => {
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.close();
      }
    };
  }, []);

  // Connection map to track peer connections
  const connectionMap = useRef<Map<string, RTCPeerConnection>>(new Map());
  
  // Create a peer connection
  const createPeerConnection = (viewerId: string) => {
    const peerConnection = new RTCPeerConnection({
      iceServers: [
        { urls: "stun:stun.l.google.com:19302" }
      ]
    });
    
    // Store in our connection map for tracking
    connectionMap.current.set(viewerId, peerConnection);
    
    peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        wsRef.current?.send(JSON.stringify({
          type: "ice-candidate",
          candidate: event.candidate,
          viewerId,
        }));
      }
    };
    
    return peerConnection;
  };

  // Start streaming
  const startStream = async () => {
    try {
      // Check if media devices are available
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("Media devices not supported in this browser");
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });
      
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
        mediaStreamRef.current = stream;
      }
      
      // Announce broadcaster is ready
      wsRef.current?.send(JSON.stringify({
        type: "broadcaster-ready",
        broadcasterId: "user-" + Math.floor(Math.random() * 10000),
      }));
      
      setIsStreaming(true);
      toast({
        title: "Live stream started",
        description: "You are now broadcasting live to your audience",
      });
      
      // Simulate viewers for demo (in real app, this would come from the server)
      setViewerCount(Math.floor(Math.random() * 10) + 5);
    } catch (error) {
      toast({
        title: "Failed to start stream",
        description: "Could not access camera or microphone. Please ensure permissions are granted.",
        variant: "destructive",
      });
    }
  };

  // Stop streaming
  const stopStream = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
    }
    
    // Close all peer connections
    peerConnections.forEach(pc => pc.close());
    setPeerConnections([]);
    
    // Announce broadcaster is stopping
    wsRef.current?.send(JSON.stringify({
      type: "broadcaster-stopped"
    }));
    
    setIsStreaming(false);
    setViewerCount(0);
    toast({
      title: "Live stream ended",
      description: "Your broadcast has ended",
    });
  };

  // Toggle audio
  const toggleAudio = () => {
    if (mediaStreamRef.current) {
      const audioTracks = mediaStreamRef.current.getAudioTracks();
      audioTracks.forEach(track => {
        track.enabled = !track.enabled;
      });
      setIsMuted(!isMuted);
    }
  };

  // Toggle video
  const toggleVideo = () => {
    if (mediaStreamRef.current) {
      const videoTracks = mediaStreamRef.current.getVideoTracks();
      videoTracks.forEach(track => {
        track.enabled = !track.enabled;
      });
      setIsVideoEnabled(!isVideoEnabled);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <Card className="overflow-hidden">
        <div className="aspect-video bg-black relative">
          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
          />
          
          {isStreaming && (
            <div className="absolute top-4 left-4 flex items-center gap-2 bg-red-500 text-white px-3 py-1 rounded-full text-sm">
              <div className="w-2 h-2 rounded-full bg-white animate-pulse"></div>
              <span>LIVE</span>
            </div>
          )}
          
          {isStreaming && (
            <div className="absolute top-4 right-4 flex items-center gap-2 bg-black/60 text-white px-3 py-1 rounded-full text-sm">
              <Users size={16} />
              <span>{viewerCount} viewers</span>
            </div>
          )}
          
          {!isVideoEnabled && isStreaming && (
            <div className="absolute inset-0 flex items-center justify-center bg-black">
              <p className="text-white">Camera is turned off</p>
            </div>
          )}
        </div>
        
        <div className="p-4 flex flex-wrap justify-between items-center">
          <div className="flex gap-2 mb-2 sm:mb-0">
            {!isStreaming ? (
              <Button 
                onClick={startStream}
                className="bg-red-500 hover:bg-red-600 text-white"
              >
                Start Streaming
              </Button>
            ) : (
              <Button 
                onClick={stopStream}
                variant="destructive"
              >
                End Stream
              </Button>
            )}
          </div>
          
          {isStreaming && (
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={toggleAudio}
                className={isMuted ? "bg-muted" : ""}
              >
                {isMuted ? <MicOff size={18} /> : <Mic size={18} />}
              </Button>
              
              <Button
                variant="outline"
                size="icon"
                onClick={toggleVideo}
                className={!isVideoEnabled ? "bg-muted" : ""}
              >
                {!isVideoEnabled ? <VideoOff size={18} /> : <Video size={18} />}
              </Button>
              
              <Button
                variant="outline"
                size="icon"
                onClick={() => {
                  const url = `${window.location.origin}/watch/${Math.floor(Math.random() * 10000)}`;
                  navigator.clipboard.writeText(url);
                  toast({ title: "Link copied", description: "Stream link copied to clipboard" });
                }}
              >
                <Share size={18} />
              </Button>
            </div>
          )}
        </div>
      </Card>
      
      {isStreaming && (
        <div className="mt-4">
          <h3 className="font-medium mb-2">Share your stream</h3>
          <div className="flex gap-2">
            <input
              type="text"
              readOnly
              value={`${window.location.origin}/watch/${Math.floor(Math.random() * 10000)}`}
              className="flex-1 px-3 py-2 border rounded-md text-sm bg-muted"
            />
            <Button
              onClick={() => {
                navigator.clipboard.writeText(`${window.location.origin}/watch/${Math.floor(Math.random() * 10000)}`);
                toast({
                  title: "Link copied",
                  description: "Stream link copied to clipboard",
                });
              }}
              variant="outline"
            >
              Copy
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}