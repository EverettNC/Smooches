import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { 
  Upload, 
  Video, 
  Radio, 
  Tv,
  FileVideo,
  Clock,
  Users,
  Play
} from "lucide-react";

export default function CreateContentPage() {
  const [contentType, setContentType] = useState<"video" | "radio" | "live">("video");
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const [videoData, setVideoData] = useState({
    title: "",
    description: "",
    file: null as File | null
  });

  const [radioData, setRadioData] = useState({
    name: "",
    description: "",
    streamUrl: "",
    coverImage: ""
  });

  const createVideoMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const response = await fetch("/api/videos", {
        method: "POST",
        body: data,
        credentials: "include",
      });
      if (!response.ok) {
        const err = await response.json().catch(() => ({ message: 'Upload failed' }));
        throw new Error(err.message || 'Upload failed');
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Video uploaded successfully!",
        description: "Your content is now live on SMOOCHES",
      });
      setLocation("/");
    },
    onError: () => {
      toast({
        title: "Upload failed",
        description: "Please try again",
        variant: "destructive",
      });
    },
  });

  const createRadioMutation = useMutation({
    mutationFn: async (data: typeof radioData) => {
      const response = await fetch("/api/radio-stations", {
        method: "POST",
        body: JSON.stringify(data),
        headers: { "Content-Type": "application/json" },
      });
      if (!response.ok) throw new Error('Station creation failed');
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Radio station created!",
        description: "Your station is ready for broadcasting",
      });
      setLocation("/radio");
    },
  });

  const handleVideoUpload = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!videoData.file || !videoData.title) {
      toast({
        title: "Missing information",
        description: "Please provide a title and select a video file",
        variant: "destructive",
      });
      return;
    }

    // Safely check the actual video duration before uploading
    const videoElement = document.createElement('video');
    videoElement.preload = 'metadata';

    videoElement.onloadedmetadata = () => {
      // Clean up memory
      window.URL.revokeObjectURL(videoElement.src);
      
      const duration = videoElement.duration;

      // 10 seconds minimum, 420 seconds (7 minutes) maximum
      if (duration < 10 || duration > 420) {
        toast({
          title: "Invalid video length",
          description: "Videos must be between 10 seconds and 7 minutes long.",
          variant: "destructive",
        });
        return;
      }

      // If it passes, execute the upload
      const formData = new FormData();
      formData.append("title", videoData.title);
      formData.append("description", videoData.description);
      formData.append("video", videoData.file!);
      createVideoMutation.mutate(formData);
    };

    videoElement.onerror = () => {
      window.URL.revokeObjectURL(videoElement.src);
      toast({
        title: "Invalid file",
        description: "Could not read the video metadata. Please try a different file.",
        variant: "destructive",
      });
    };

    videoElement.src = URL.createObjectURL(videoData.file);
  };

  const handleRadioCreate = (e: React.FormEvent) => {
    e.preventDefault();
    createRadioMutation.mutate(radioData);
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="container mx-auto max-w-4xl space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
            Create Content
          </h1>
          <p className="text-muted-foreground">
            Share your creativity with the SMOOCHES community
          </p>
        </div>

        {/* Content Type Selection */}
        <div className="grid md:grid-cols-3 gap-4">
          <Card 
            className={`cursor-pointer transition-all ${
              contentType === "video" 
                ? "border-primary bg-primary/5" 
                : "border-border hover:border-primary/50"
            }`}
            onClick={() => setContentType("video")}
          >
            <CardContent className="p-6 text-center space-y-3">
              <Video className="w-8 h-8 mx-auto text-primary" />
              <div>
                <h3 className="font-semibold">Video</h3>
                <p className="text-sm text-muted-foreground">10 sec - 7 min videos</p>
              </div>
              <Badge variant={contentType === "video" ? "default" : "outline"}>
                <Clock className="w-3 h-3 mr-1" />
                10s - 7m
              </Badge>
            </CardContent>
          </Card>

          <Card 
            className={`cursor-pointer transition-all ${
              contentType === "radio" 
                ? "border-secondary bg-secondary/5" 
                : "border-border hover:border-secondary/50"
            }`}
            onClick={() => setContentType("radio")}
          >
            <CardContent className="p-6 text-center space-y-3">
              <Radio className="w-8 h-8 mx-auto text-secondary" />
              <div>
                <h3 className="font-semibold">Radio Station</h3>
                <p className="text-sm text-muted-foreground">Scheduled shows</p>
              </div>
              <Badge variant={contentType === "radio" ? "default" : "outline"}>
                <Users className="w-3 h-3 mr-1" />
                Audience
              </Badge>
            </CardContent>
          </Card>

          <Card 
            className={`cursor-pointer transition-all ${
              contentType === "live" 
                ? "border-accent bg-accent/5" 
                : "border-border hover:border-accent/50"
            }`}
            onClick={() => setContentType("live")}
          >
            <CardContent className="p-6 text-center space-y-3">
              <Tv className="w-8 h-8 mx-auto text-accent" />
              <div>
                <h3 className="font-semibold">Live Stream</h3>
                <p className="text-sm text-muted-foreground">Real-time content</p>
              </div>
              <Badge variant={contentType === "live" ? "default" : "outline"}>
                <Play className="w-3 h-3 mr-1" />
                Live
              </Badge>
            </CardContent>
          </Card>
        </div>

        {/* Content Creation Forms */}
        {contentType === "video" && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileVideo className="w-5 h-5 text-primary" />
                Upload Video
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleVideoUpload} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="video-file">Video File</Label>
                  <Input
                    id="video-file"
                    type="file"
                    accept="video/*"
                    onChange={(e) => setVideoData(prev => ({ 
                      ...prev, 
                      file: e.target.files?.[0] || null 
                    }))}
                    className="file:bg-primary file:text-primary-foreground file:border-0 file:rounded-md file:px-4 file:py-2"
                  />
                  <p className="text-xs text-muted-foreground">
                    Videos must be between 10 seconds and 7 minutes long. Supported formats: MP4, MOV, AVI
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="video-title">Title</Label>
                  <Input
                    id="video-title"
                    placeholder="Give your video a catchy title..."
                    value={videoData.title}
                    onChange={(e) => setVideoData(prev => ({ 
                      ...prev, 
                      title: e.target.value 
                    }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="video-description">Description</Label>
                  <Textarea
                    id="video-description"
                    placeholder="Tell viewers what your video is about..."
                    value={videoData.description}
                    onChange={(e) => setVideoData(prev => ({ 
                      ...prev, 
                      description: e.target.value 
                    }))}
                    rows={4}
                  />
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90"
                  disabled={createVideoMutation.isPending}
                >
                  <Upload className="w-4 h-4 mr-2" />
                  {createVideoMutation.isPending ? "Uploading..." : "Upload Video"}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {contentType === "radio" && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Radio className="w-5 h-5 text-secondary" />
                Create Radio Station
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleRadioCreate} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="station-name">Station Name</Label>
                  <Input
                    id="station-name"
                    placeholder="Your radio station name..."
                    value={radioData.name}
                    onChange={(e) => setRadioData(prev => ({ 
                      ...prev, 
                      name: e.target.value 
                    }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="station-description">Description</Label>
                  <Textarea
                    id="station-description"
                    placeholder="What kind of content will you broadcast?"
                    value={radioData.description}
                    onChange={(e) => setRadioData(prev => ({ 
                      ...prev, 
                      description: e.target.value 
                    }))}
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="stream-url">Stream URL</Label>
                  <Input
                    id="stream-url"
                    placeholder="https://your-stream-url.com"
                    value={radioData.streamUrl}
                    onChange={(e) => setRadioData(prev => ({ 
                      ...prev, 
                      streamUrl: e.target.value 
                    }))}
                  />
                  <p className="text-xs text-muted-foreground">
                    Your audio stream URL for broadcasting
                  </p>
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-gradient-to-r from-secondary to-primary hover:from-secondary/90 hover:to-primary/90"
                  disabled={createRadioMutation.isPending}
                >
                  <Radio className="w-4 h-4 mr-2" />
                  {createRadioMutation.isPending ? "Creating..." : "Create Station"}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {contentType === "live" && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Tv className="w-5 h-5 text-accent" />
                Go Live
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-6">
              <div className="space-y-4">
                <div className="w-24 h-24 mx-auto bg-gradient-to-br from-accent to-accent/80 rounded-full flex items-center justify-center">
                  <Tv className="w-12 h-12 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold">Ready to Stream?</h3>
                  <p className="text-muted-foreground">
                    Start your live stream for stunts, games, and real-time interaction with your audience.
                  </p>
                </div>
              </div>
              
              <Button 
                onClick={() => setLocation("/live")}
                className="bg-gradient-to-r from-accent to-primary hover:from-accent/90 hover:to-primary/90"
                size="lg"
              >
                <Tv className="w-5 h-5 mr-2" />
                Start Live Stream
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
