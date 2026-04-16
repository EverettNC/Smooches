import { useEffect, useRef } from "react";
import Hls from "hls.js";
import { Card } from "@/components/ui/card";

interface StreamPlayerProps {
  streamUrl: string;
}

export function StreamPlayer({ streamUrl }: StreamPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current) {
      const hls = new Hls();
      hls.loadSource(streamUrl);
      hls.attachMedia(videoRef.current);
    }
  }, [streamUrl]);

  return (
    <Card className="relative w-full aspect-video bg-black overflow-hidden">
      <video
        ref={videoRef}
        className="w-full h-full"
        controls
        playsInline
        autoPlay
      />
      <div className="absolute top-4 left-4 bg-red-500 text-white px-2 py-1 rounded-md text-sm">
        LIVE
      </div>
    </Card>
  );
}
