import { Link } from "wouter";
import { useAuth } from "@/hooks/use-auth-simple";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Radio, Video, Users, Award, TrendingUp } from "lucide-react";

export default function HomePage() {
  const { user, logout } = useAuth();
  
  return (
    <div className="container max-w-4xl mx-auto py-8 px-4">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold mb-4">
          Welcome to Smooches, {user?.displayName || user?.username || "Guest"} 💋
        </h1>
        <p className="text-xl text-muted-foreground mb-6">
          Connect and collaborate through interactive audio streaming
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Link href="/feed">
            <Button size="lg" className="bg-gradient-to-r from-pink-500 to-purple-600 border-none">
              <Video className="mr-2 h-5 w-5" />
              <span>Explore Feed</span>
            </Button>
          </Link>
          <Link href="/live">
            <Button size="lg" variant="secondary">
              <Radio className="mr-2 h-5 w-5" />
              <span>Join Live</span>
            </Button>
          </Link>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
        <Card className="p-6">
          <div className="flex items-start gap-4">
            <div className="bg-primary/10 p-3 rounded-lg">
              <Video className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="text-xl font-bold mb-2">Video Feed</h3>
              <p className="text-muted-foreground mb-4">
                Browse videos from creators, like, comment, and share your favorites.
              </p>
              <Link href="/feed">
                <Button variant="outline" size="sm">Explore Videos</Button>
              </Link>
            </div>
          </div>
        </Card>
        
        <Card className="p-6">
          <div className="flex items-start gap-4">
            <div className="bg-primary/10 p-3 rounded-lg">
              <Radio className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="text-xl font-bold mb-2">Live Streaming</h3>
              <p className="text-muted-foreground mb-4">
                Watch live broadcasts and interact with creators in real-time.
              </p>
              <Link href="/live">
                <Button variant="outline" size="sm">Go Live</Button>
              </Link>
            </div>
          </div>
        </Card>
      </div>
      
      <Card className="p-6 mb-6">
        <h3 className="text-xl font-bold mb-4">Trending Now</h3>
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
            <TrendingUp className="h-5 w-5 text-accent" />
            <div>
              <p className="font-medium">Dance Challenge</p>
              <p className="text-sm text-muted-foreground">12.3K participants this week</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
            <Award className="h-5 w-5 text-primary" />
            <div>
              <p className="font-medium">Creator Spotlight: DJMikeV</p>
              <p className="text-sm text-muted-foreground">Friday Night Mix at 8 PM</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
            <Users className="h-5 w-5 text-secondary" />
            <div>
              <p className="font-medium">New Creator Program</p>
              <p className="text-sm text-muted-foreground">Join now to get early access benefits</p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}