import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LiveStreamBroadcaster } from "@/components/live-stream-broadcaster";
import { LiveStreamViewer } from "@/components/live-stream-viewer";
import { Button } from "@/components/ui/button";
import { Play, PlusCircle, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function LivePage() {
  const [activeTab, setActiveTab] = useState<string>("watch");
  const [remindedEvents, setRemindedEvents] = useState<string[]>([]);
  const { toast } = useToast();

  const toggleReminder = (eventId: string, title: string) => {
    if (remindedEvents.includes(eventId)) {
      setRemindedEvents(prev => prev.filter(id => id !== eventId));
      toast({ title: "Reminder removed", description: `You won't be reminded about ${title}` });
    } else {
      setRemindedEvents(prev => [...prev, eventId]);
      toast({ title: "Reminder set!", description: `We'll remind you before ${title} starts` });
    }
  };

  // Sample featured streams
  const featuredStreams = [
    { id: "stream1", streamerName: "Kiki", viewers: 243, title: "Morning Vibes" },
    { id: "stream2", streamerName: "Lash", viewers: 187, title: "Music Session" },
    { id: "stream3", streamerName: "Big Tank", viewers: 56, title: "Late Night Chat" },
  ];
  
  // Currently viewing stream
  const [selectedStream, setSelectedStream] = useState(featuredStreams[0]);
  
  return (
    <div className="min-h-screen bg-background p-4">
      <div className="container mx-auto max-w-6xl">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">🔴 Live Streaming</h1>
          <Button 
            onClick={() => setActiveTab("broadcast")}
            className="bg-red-500 hover:bg-red-600 text-white gap-2"
          >
            <Play className="h-4 w-4" />
            Go Live
          </Button>
        </div>
      
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList className="grid grid-cols-2 w-full max-w-md">
              <TabsTrigger value="watch">Watch Streams</TabsTrigger>
              <TabsTrigger value="broadcast">Broadcast</TabsTrigger>
            </TabsList>
        
        <TabsContent value="watch" className="space-y-6">
          {/* Main viewer */}
          <LiveStreamViewer 
            streamId={selectedStream.id} 
            streamerName={selectedStream.streamerName} 
          />
          
          {/* Featured streams */}
          <div>
            <h2 className="text-xl font-bold mb-3">Featured Live Streams</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {featuredStreams.map(stream => (
                <Card 
                  key={stream.id}
                  className={`overflow-hidden cursor-pointer transition-all ${
                    selectedStream.id === stream.id ? 'ring-2 ring-primary' : ''
                  }`}
                  onClick={() => setSelectedStream(stream)}
                >
                  <div className="aspect-video bg-black relative">
                    {/* Thumbnail from random placeholder for demo */}
                    <img
                      src={`https://picsum.photos/seed/${stream.id}/400/225`}
                      alt={`${stream.streamerName}'s stream`}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 left-2 bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-sm flex items-center">
                      <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse mr-1"></div>
                      LIVE
                    </div>
                    <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded-sm">
                      {stream.viewers} watching
                    </div>
                    <Button 
                      size="sm" 
                      className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedStream(stream);
                      }}
                    >
                      <Play className="w-4 h-4 mr-1" /> Watch
                    </Button>
                  </div>
                  <div className="p-3">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-white text-xs">
                        {stream.streamerName.charAt(0)}
                      </div>
                      <span className="font-medium">{stream.streamerName}</span>
                    </div>
                    <p className="text-sm truncate mt-1">{stream.title}</p>
                  </div>
                </Card>
              ))}
            </div>
          </div>
          
          {/* Upcoming events */}
          <div>
            <h2 className="text-xl font-bold mb-3">Upcoming Live Events</h2>
            <div className="space-y-3">
              <Card className="p-4">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold">
                    DJ
                  </div>
                  <div>
                    <h3 className="font-bold">Friday Night DJ Session</h3>
                    <p className="text-sm text-muted-foreground">Friday, 8:00 PM</p>
                  </div>
                  <Button
                    size="sm"
                    className="ml-auto"
                    variant={remindedEvents.includes("dj-session") ? "default" : "outline"}
                    onClick={() => toggleReminder("dj-session", "Friday Night DJ Session")}
                  >
                    <PlusCircle className="w-4 h-4 mr-1" /> {remindedEvents.includes("dj-session") ? "Reminded" : "Remind"}
                  </Button>
                </div>
              </Card>

              <Card className="p-4">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-gradient-to-br from-amber-500 to-red-500 flex items-center justify-center text-white font-bold">
                    CM
                  </div>
                  <div>
                    <h3 className="font-bold">Cooking with Chef Mike</h3>
                    <p className="text-sm text-muted-foreground">Saturday, 6:30 PM</p>
                  </div>
                  <Button
                    size="sm"
                    className="ml-auto"
                    variant={remindedEvents.includes("chef-mike") ? "default" : "outline"}
                    onClick={() => toggleReminder("chef-mike", "Cooking with Chef Mike")}
                  >
                    <PlusCircle className="w-4 h-4 mr-1" /> {remindedEvents.includes("chef-mike") ? "Reminded" : "Remind"}
                  </Button>
                </div>
              </Card>

              <Card className="p-4">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-teal-500 flex items-center justify-center text-white font-bold">
                    MT
                  </div>
                  <div>
                    <h3 className="font-bold">Monday Motivation Talk</h3>
                    <p className="text-sm text-muted-foreground">Monday, 9:00 AM</p>
                  </div>
                  <Button
                    size="sm"
                    className="ml-auto"
                    variant={remindedEvents.includes("motivation-talk") ? "default" : "outline"}
                    onClick={() => toggleReminder("motivation-talk", "Monday Motivation Talk")}
                  >
                    <PlusCircle className="w-4 h-4 mr-1" /> {remindedEvents.includes("motivation-talk") ? "Reminded" : "Remind"}
                  </Button>
                </div>
              </Card>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="broadcast">
          <div className="mb-6">
            <h2 className="text-xl font-bold mb-1">Start Your Live Stream</h2>
            <p className="text-muted-foreground mb-4">
              Connect with your audience in real-time by going live. Set up your camera and microphone, then click "Start Streaming" to begin.
            </p>
          </div>
          
          <LiveStreamBroadcaster />
          
          <div className="mt-8">
            <h3 className="font-bold mb-2">Streaming Guidelines</h3>
            <ul className="space-y-2 text-sm text-muted-foreground list-disc pl-5">
              <li>Ensure you have a stable internet connection</li>
              <li>Use good lighting and a clear microphone</li>
              <li>Engage with your viewers through the chat</li>
              <li>Follow community guidelines - no explicit/harmful content</li>
              <li>Have fun and be authentic!</li>
            </ul>
          </div>
        </TabsContent>
          </Tabs>
      </div>
    </div>
  );
}