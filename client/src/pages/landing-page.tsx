import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLocation } from "wouter";
import { 
  Play, 
  Radio, 
  Tv, 
  Users,
  Gift,
  Mic,
  Heart,
  MessageCircle,
  Share,
  TrendingUp,
  Star
} from "lucide-react";

export default function LandingPage() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-card/20 to-background">
      {/* Header */}
      <header className="border-b bg-card/80 backdrop-blur sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="text-3xl">💋</div>
              <div className="text-3xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent tracking-wide">
                SMOOCHES
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <Button 
                variant="outline" 
                onClick={() => setLocation("/auth")}
              >
                Sign In
              </Button>
              <Button 
                onClick={() => setLocation("/auth")}
                className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90"
              >
                Get Started
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center space-y-8">
          <div className="space-y-4">
            <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
              Create. Connect. Earn.
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              The ultimate social media platform for content creators. Share 3-5 minute videos, 
              host live radio shows, stream interactive content, and monetize your creativity.
            </p>
          </div>
          
          <div className="flex flex-wrap justify-center gap-4">
            <Button 
              size="lg"
              onClick={() => setLocation("/auth")}
              className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-lg px-8 py-6"
            >
              <Play className="w-5 h-5 mr-2" />
              Start Creating
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="text-lg px-8 py-6 border-primary/30 hover:border-primary/60"
              onClick={() => setLocation("/auth")}
            >
              <Users className="w-5 h-5 mr-2" />
              Join Community
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-card/30">
        <div className="container mx-auto">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl md:text-4xl font-bold">Everything You Need to Succeed</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              From viral short videos to scheduled radio shows, SMOOCHES gives creators every tool to build their audience.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Video Content */}
            <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20 hover:border-primary/40 transition-colors">
              <CardContent className="p-8 text-center space-y-4">
                <div className="w-16 h-16 mx-auto bg-gradient-to-br from-primary to-primary/80 rounded-full flex items-center justify-center">
                  <Play className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold">Short-Form Videos</h3>
                <p className="text-muted-foreground">
                  Create engaging 3-5 minute videos for the For You Page. Get likes, comments, and gifts from your audience.
                </p>
                <div className="flex justify-center space-x-4 pt-2">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Heart className="w-4 h-4 mr-1 text-accent" />
                    Likes
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <MessageCircle className="w-4 h-4 mr-1 text-secondary" />
                    Comments
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Gift className="w-4 h-4 mr-1 text-primary" />
                    Gifts
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Radio Stations */}
            <Card className="bg-gradient-to-br from-secondary/10 to-secondary/5 border-secondary/20 hover:border-secondary/40 transition-colors">
              <CardContent className="p-8 text-center space-y-4">
                <div className="w-16 h-16 mx-auto bg-gradient-to-br from-secondary to-secondary/80 rounded-full flex items-center justify-center">
                  <Radio className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold">Radio Shows</h3>
                <p className="text-muted-foreground">
                  Create and schedule your own radio station. Build a loyal audience with regular programming.
                </p>
                <div className="flex justify-center space-x-4 pt-2">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Mic className="w-4 h-4 mr-1 text-primary" />
                    Live Audio
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Users className="w-4 h-4 mr-1 text-secondary" />
                    Subscribers
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Live Streaming */}
            <Card className="bg-gradient-to-br from-accent/10 to-accent/5 border-accent/20 hover:border-accent/40 transition-colors">
              <CardContent className="p-8 text-center space-y-4">
                <div className="w-16 h-16 mx-auto bg-gradient-to-br from-accent to-accent/80 rounded-full flex items-center justify-center">
                  <Tv className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold">Live Streams</h3>
                <p className="text-muted-foreground">
                  Go live for stunts, games, and interactive content. Engage with your audience in real-time.
                </p>
                <div className="flex justify-center space-x-4 pt-2">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Tv className="w-4 h-4 mr-1 text-accent" />
                    Live Video
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <MessageCircle className="w-4 h-4 mr-1 text-primary" />
                    Real-time Chat
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Ambassador Program */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="text-center space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-center gap-2">
                <Star className="w-8 h-8 text-primary" />
                <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                  Ambassador Program
                </h2>
                <Star className="w-8 h-8 text-accent" />
              </div>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                Top creators get featured on Amazon Prime and podcast platforms. 
                Turn your passion into profit and reach millions of viewers worldwide.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 mt-12">
              <Card className="bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20">
                <CardContent className="p-8 space-y-4">
                  <div className="flex items-center gap-3">
                    <TrendingUp className="w-6 h-6 text-primary" />
                    <h3 className="text-xl font-semibold">Amazon Prime Features</h3>
                  </div>
                  <p className="text-muted-foreground">
                    Outstanding content gets featured on Amazon Prime, giving you access to a global audience 
                    and premium monetization opportunities.
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-secondary/5 to-primary/5 border-secondary/20">
                <CardContent className="p-8 space-y-4">
                  <div className="flex items-center gap-3">
                    <Radio className="w-6 h-6 text-secondary" />
                    <h3 className="text-xl font-semibold">Podcast Distribution</h3>
                  </div>
                  <p className="text-muted-foreground">
                    Your radio shows can be distributed as podcasts on major platforms, 
                    expanding your reach and creating additional revenue streams.
                  </p>
                </CardContent>
              </Card>
            </div>

            <Button 
              size="lg"
              onClick={() => setLocation("/auth")}
              className="bg-gradient-to-r from-primary via-secondary to-accent hover:from-primary/90 hover:via-secondary/90 hover:to-accent/90 text-lg px-12 py-6 mt-8"
            >
              <Gift className="w-5 h-5 mr-2" />
              Become an Ambassador
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-card/50 py-12 px-4">
        <div className="container mx-auto text-center">
          <div className="text-2xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent mb-4">
            SMOOCHES
          </div>
          <p className="text-muted-foreground">
            The future of social media is here. Join thousands of creators building their audience.
          </p>
        </div>
      </footer>
    </div>
  );
}