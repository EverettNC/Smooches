import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Play, Share2, Sparkles, TrendingUp, BarChart2, Settings, Zap, DollarSign } from "lucide-react";

import { mockClips } from "@/lib/mock-data";
import type { Clip } from "@shared/schema";

export function ClipMonetization() {
  const [monetizationEnabled, setMonetizationEnabled] = useState(true);
  const [autoClipping, setAutoClipping] = useState(true);
  const [revenueShare, setRevenueShare] = useState(70);
  const [chartTab, setChartTab] = useState("views");
  const { toast } = useToast();
  
  // Fetch clips data
  const { data: clips, isLoading } = useQuery<Clip[]>({
    queryKey: ["/api/clips"],
    enabled: true,
  });

  const clipData: Clip[] = clips || mockClips;

  // Simulate clip performance data
  const clipPerformanceData = [
    { name: 'Jan', views: 1200, earnings: 24 },
    { name: 'Feb', views: 1900, earnings: 38 },
    { name: 'Mar', views: 3000, earnings: 60 },
    { name: 'Apr', views: 2780, earnings: 55.6 },
    { name: 'May', views: 1890, earnings: 37.8 },
    { name: 'Jun', views: 2390, earnings: 47.8 },
    { name: 'Jul', views: 3490, earnings: 69.8 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h2 className="text-2xl font-bold tracking-tight">Clip Monetization</h2>
        <p className="text-muted-foreground">
          Configure how your clips generate revenue and track their performance
        </p>
      </div>

      {/* Clip Monetization Settings */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Monetization Settings</CardTitle>
            <CardDescription>
              Configure how you earn from your clips
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="monetization">Enable Clip Monetization</Label>
                <p className="text-sm text-muted-foreground">
                  Allow ads to be shown on your clips
                </p>
              </div>
              <Switch
                id="monetization"
                checked={monetizationEnabled}
                onCheckedChange={setMonetizationEnabled}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="auto-clipping">Auto-Clipping</Label>
                <p className="text-sm text-muted-foreground">
                  Automatically create clips from your radio shows
                </p>
              </div>
              <Switch
                id="auto-clipping"
                checked={autoClipping}
                onCheckedChange={setAutoClipping}
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="revenue-share">Your Revenue Share: {revenueShare}%</Label>
                <span className="text-sm text-muted-foreground">Platform: {100 - revenueShare}%</span>
              </div>
              <Slider
                id="revenue-share"
                defaultValue={[revenueShare]}
                max={90}
                min={50}
                step={5}
                onValueChange={(value) => setRevenueShare(value[0])}
                disabled={!monetizationEnabled}
              />
              <p className="text-sm text-muted-foreground">
                Standard share is 70% for creators, 30% for platform
              </p>
            </div>
          </CardContent>
          <CardFooter>
            <Button
              className="w-full"
              onClick={() => toast({ title: "Settings saved", description: `Monetization ${monetizationEnabled ? "enabled" : "disabled"}, ${revenueShare}% revenue share` })}
            >
              Save Settings
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Clip Creator Promotion</CardTitle>
            <CardDescription>
              Special program for clip creators
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="rounded-lg bg-gradient-to-r from-purple-500/10 to-blue-500/10 p-4">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-purple-500" />
                <h3 className="font-medium">Clip Creator Premium</h3>
                <Badge variant="secondary" className="ml-auto">PRO</Badge>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                Premium creators earn 85% revenue share on all clips and get priority promotion
              </p>
              
              <div className="mt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Progress to Premium</span>
                  <span className="font-medium">65%</span>
                </div>
                <Progress value={65} className="h-2" />
              </div>
              
              <div className="mt-4 grid grid-cols-2 gap-2 text-center text-sm">
                <div>
                  <div className="font-medium">Requirements</div>
                  <div className="text-muted-foreground">10 clips weekly</div>
                </div>
                <div>
                  <div className="font-medium">Your Status</div>
                  <div className="text-muted-foreground">6.5 clips weekly</div>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="font-medium">Recommendations to Increase Earnings</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-green-500" />
                  Create clips from highest engagement moments
                </li>
                <li className="flex items-center gap-2">
                  <Share2 className="h-4 w-4 text-blue-500" />
                  Share clips to social media for wider reach
                </li>
                <li className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-amber-500" />
                  Create clips under 30 seconds for best performance
                </li>
              </ul>
            </div>
          </CardContent>
          <CardFooter>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => toast({ title: "Application submitted!", description: "We'll review your application and get back to you within 48 hours" })}
            >
              Apply for Premium
            </Button>
          </CardFooter>
        </Card>
      </div>

      {/* Clip Performance Metrics */}
      <Card>
        <CardHeader>
          <CardTitle>Clip Performance</CardTitle>
          <CardDescription>
            Track how your clips are performing
          </CardDescription>
          <div className="flex items-center gap-2">
            <Tabs value={chartTab} onValueChange={setChartTab}>
              <TabsList>
                <TabsTrigger value="views">Views</TabsTrigger>
                <TabsTrigger value="earnings">Earnings</TabsTrigger>
                <TabsTrigger value="engagement">Engagement</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={clipPerformanceData}
                margin={{
                  top: 5,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
                <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
                <Tooltip formatter={(value, name) => [name === 'earnings' ? `$${value}` : value, name === 'earnings' ? 'Earnings' : 'Views']} />
                <Bar yAxisId="left" dataKey="views" fill="#8884d8" name="Views" />
                <Bar yAxisId="right" dataKey="earnings" fill="#82ca9d" name="Earnings" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Top Performing Clips */}
      <Card>
        <CardHeader>
          <CardTitle>Top Performing Clips</CardTitle>
          <CardDescription>
            Your clips with the highest earnings
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-5">
            {clipData.slice(0, 3).map((clip: Clip, index: number) => (
              <div key={index} className="flex items-start gap-4">
                <div className="relative aspect-video h-24 overflow-hidden rounded-md">
                  <img
                    src={clip.thumbnailUrl}
                    alt={clip.title}
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity hover:opacity-100">
                    <Play className="h-8 w-8 text-white" />
                  </div>
                  <Badge className="absolute bottom-2 right-2 bg-black/60">{clip.duration}s</Badge>
                </div>
                <div className="flex-1 space-y-1">
                  <h3 className="font-medium line-clamp-1">{clip.title}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-1">{clip.showName}</p>
                  <div className="flex items-center gap-3 text-sm">
                    <span className="flex items-center gap-1">
                      <BarChart2 className="h-3 w-3" /> 5.2K views
                    </span>
                    <span className="flex items-center gap-1 text-green-500">
                      <DollarSign className="h-3 w-3" /> ${(index + 1) * 12.50}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
        <CardFooter>
          <Button variant="outline" className="w-full" onClick={() => { window.location.href = "/clips"; }}>View All Clips</Button>
        </CardFooter>
      </Card>

      {/* Monetization Strategy */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Monetization Strategy</CardTitle>
          <CardDescription>
            Optimize your clip creation for maximum revenue
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2 rounded-lg border p-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-500" />
                <h3 className="font-medium">Length Optimization</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Clips between 15-30 seconds have the highest engagement and monetization potential.
              </p>
            </div>
            
            <div className="space-y-2 rounded-lg border p-4">
              <div className="flex items-center gap-2">
                <Settings className="h-5 w-5 text-blue-500" />
                <h3 className="font-medium">Content Tags</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Add relevant tags to your clips to increase discovery and ad relevance.
              </p>
            </div>
            
            <div className="space-y-2 rounded-lg border p-4">
              <div className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-amber-500" />
                <h3 className="font-medium">Thumbnail Quality</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Custom thumbnails increase click-through rates by up to 40%.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}