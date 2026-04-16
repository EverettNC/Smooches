import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { VideoFeed } from "@/components/video-feed";
import { RadioPlayer } from "@/components/radio-player";
import { LiveStreamViewer } from "@/components/live-stream-viewer";
import { 
  Play, 
  Radio, 
  Tv, 
  Upload, 
  Calendar,
  Users,
  TrendingUp,
  Mic,
  Gift
} from "lucide-react";

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<"fyp" | "radio" | "live">("fyp");
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="text-2xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                SMOOCHES
              </div>
              <Badge variant="secondary" className="text-xs">SOCIAL</Badge>
            </div>
            
            <nav className="flex items-center space-x-6">
              <Button 
                variant={activeTab === "fyp" ? "default" : "ghost"}
                onClick={() => setActiveTab("fyp")}
                className="flex items-center gap-2"
              >
                <Play className="w-4 h-4" />
                For You
              </Button>
              <Button 
                variant={activeTab === "radio" ? "default" : "ghost"}
                onClick={() => setActiveTab("radio")}
                className="flex items-center gap-2"
              >
                <Radio className="w-4 h-4" />
                Radio
              </Button>
              <Button 
                variant={activeTab === "live" ? "default" : "ghost"}
                onClick={() => setActiveTab("live")}
                className="flex items-center gap-2"
              >
                <Tv className="w-4 h-4" />
                Live
              </Button>
            </nav>

            <div className="flex items-center space-x-3">
              <Button
                onClick={() => setLocation("/create")}
                className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90"
              >
                <Upload className="w-4 h-4 mr-2" />
                Create
              </Button>
              <Button variant="outline" onClick={() => setLocation("/profile")}>
                Profile
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        {activeTab === "fyp" && (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                Discover Amazing Content
              </h1>
              <p className="text-muted-foreground">
                Short-form videos from creators worldwide. Like, comment, and gift your favorites.
              </p>
            </div>
            
            {/* FYP Video Feed */}
            <div className="grid gap-6">
              <VideoFeed />
            </div>
          </div>
        )}

        {activeTab === "radio" && (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                Live Radio Stations
              </h1>
              <p className="text-muted-foreground">
                Tune into scheduled shows and discover new voices. Create your own station.
              </p>
            </div>

            {/* Radio Station Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card className="border-2 border-dashed border-primary/30 hover:border-primary/60 transition-colors cursor-pointer"
                    onClick={() => setLocation("/create")}>
                <CardContent className="p-6 text-center space-y-4">
                  <div className="w-16 h-16 mx-auto bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center">
                    <Mic className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Create Station</h3>
                    <p className="text-sm text-muted-foreground">Start your own radio show</p>
                  </div>
                </CardContent>
              </Card>

              {/* Placeholder for radio stations */}
              <Card className="bg-gradient-to-br from-card to-card/50 border-primary/20">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="w-full h-32 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-lg flex items-center justify-center">
                      <Radio className="w-8 h-8 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold">Coming Soon</h3>
                      <p className="text-sm text-muted-foreground">Radio stations will appear here</p>
                      <Badge variant="outline" className="mt-2">
                        <Users className="w-3 h-3 mr-1" />
                        0 listeners
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {activeTab === "live" && (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                Live Streams
              </h1>
              <p className="text-muted-foreground">
                Watch live content, interact with creators, and participate in real-time.
              </p>
            </div>

            {/* Live Streams Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card className="border-2 border-dashed border-accent/30 hover:border-accent/60 transition-colors cursor-pointer"
                    onClick={() => setLocation("/live")}>
                <CardContent className="p-6 text-center space-y-4">
                  <div className="w-16 h-16 mx-auto bg-gradient-to-br from-accent to-primary rounded-full flex items-center justify-center">
                    <Tv className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Go Live</h3>
                    <p className="text-sm text-muted-foreground">Start your live stream</p>
                  </div>
                </CardContent>
              </Card>

              {/* Placeholder for live streams */}
              <Card className="bg-gradient-to-br from-card to-card/50 border-accent/20">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="w-full h-32 bg-gradient-to-br from-accent/20 to-primary/20 rounded-lg flex items-center justify-center">
                      <Tv className="w-8 h-8 text-accent" />
                    </div>
                    <div>
                      <h3 className="font-semibold">No Live Streams</h3>
                      <p className="text-sm text-muted-foreground">Be the first to go live!</p>
                      <Badge variant="outline" className="mt-2">
                        <TrendingUp className="w-3 h-3 mr-1" />
                        Ready to stream
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </main>

      {/* Ambassador Program Banner */}
      <div className="border-t bg-gradient-to-r from-primary/10 via-secondary/10 to-accent/10">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center gap-2">
              <Gift className="w-6 h-6 text-primary" />
              <h2 className="text-xl font-bold">SMOOCHES Ambassador Program</h2>
            </div>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Top creators get featured on Amazon Prime and podcast platforms. 
              Build your audience, earn from your content, and reach millions.
            </p>
            <Button 
              onClick={() => setLocation("/monetization")}
              className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90"
            >
              Learn More
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}