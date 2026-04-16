import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { RadioPlayer } from "@/components/radio-player";
import { RadioScheduler } from "@/components/radio/radio-scheduler";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { CalendarPlus, Radio as RadioIcon, Plus, Upload, Mic } from "lucide-react";
import { useAuth } from "@/hooks/use-auth-simple";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import type { RadioStation } from "@shared/schema";

export default function Radio() {
  const [isSchedulerOpen, setIsSchedulerOpen] = useState(false);
  const [selectedStationId, setSelectedStationId] = useState<number | null>(null);
  const [isCreateStationOpen, setIsCreateStationOpen] = useState(false);
  const [scheduleForm, setScheduleForm] = useState({ title: "", date: "", startTime: "", duration: "60", description: "" });
  const [stationForm, setStationForm] = useState({ name: "", description: "", streamUrl: "" });
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();

  const { data: stations = [], isLoading } = useQuery<RadioStation[]>({
    queryKey: ["/api/radio-stations"],
  });

  const createStationMutation = useMutation({
    mutationFn: async (data: typeof stationForm) => {
      const res = await fetch("/api/radio-stations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ ...data, isActive: true }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "Failed to create station");
      }
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Radio station created!", description: "Your station is now live." });
      queryClient.invalidateQueries({ queryKey: ["/api/radio-stations"] });
      setIsCreateStationOpen(false);
      setStationForm({ name: "", description: "", streamUrl: "" });
    },
    onError: (e: any) => toast({ title: "Failed to create station", description: e.message, variant: "destructive" }),
  });

  const scheduleShowMutation = useMutation({
    mutationFn: async () => {
      if (!selectedStationId) throw new Error("Select a station first");
      const startDateTime = new Date(`${scheduleForm.date}T${scheduleForm.startTime}`);
      const endDateTime = new Date(startDateTime.getTime() + parseInt(scheduleForm.duration) * 60000);
      const res = await fetch("/api/radio-schedules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          stationId: selectedStationId,
          showName: scheduleForm.title,
          description: scheduleForm.description,
          startTime: startDateTime.toISOString(),
          endTime: endDateTime.toISOString(),
        }),
      });
      if (!res.ok) throw new Error("Failed to schedule show");
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Show scheduled!", description: "Your recording session has been scheduled." });
      setScheduleForm({ title: "", date: "", startTime: "", duration: "60", description: "" });
    },
    onError: (e: any) => toast({ title: "Failed to schedule", description: e.message, variant: "destructive" }),
  });

  if (isLoading) {
    return (
      <main className="min-h-screen bg-background p-4">
        <div className="container max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold mb-8 text-center">Radio Hub</h1>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => <Skeleton key={i} className="h-40" />)}
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background p-4">
      <div className="container max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">Radio Hub</h1>
          {user && (
            <div className="flex gap-2">
              <Dialog open={isCreateStationOpen} onOpenChange={setIsCreateStationOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="gap-2">
                    <Mic className="h-4 w-4" />
                    New Station
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader><DialogTitle>Create Radio Station</DialogTitle></DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label>Station Name</Label>
                      <Input
                        placeholder="My Awesome Station"
                        value={stationForm.name}
                        onChange={e => setStationForm(p => ({ ...p, name: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label>Description</Label>
                      <Textarea
                        placeholder="What kind of content will you broadcast?"
                        value={stationForm.description}
                        onChange={e => setStationForm(p => ({ ...p, description: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label>Stream URL (optional)</Label>
                      <Input
                        placeholder="https://your-stream-url.com"
                        value={stationForm.streamUrl}
                        onChange={e => setStationForm(p => ({ ...p, streamUrl: e.target.value }))}
                      />
                      <p className="text-xs text-muted-foreground mt-1">Leave blank to use SMOOCHES built-in streaming</p>
                    </div>
                    <Button
                      className="w-full"
                      onClick={() => createStationMutation.mutate(stationForm)}
                      disabled={!stationForm.name || createStationMutation.isPending}
                    >
                      {createStationMutation.isPending ? "Creating..." : "Create Station"}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>

              <Dialog open={isSchedulerOpen} onOpenChange={setIsSchedulerOpen}>
                <DialogTrigger asChild>
                  <Button className="gap-2">
                    <CalendarPlus className="h-4 w-4" />
                    Schedule Show
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader><DialogTitle>Schedule Radio Show</DialogTitle></DialogHeader>
                  <div className="space-y-4">
                    {stations.length === 0 ? (
                      <p className="text-muted-foreground text-sm">Create a station first before scheduling a show.</p>
                    ) : (
                      <>
                        <div>
                          <Label>Station</Label>
                          <select
                            className="w-full p-2 border rounded-lg bg-background"
                            value={selectedStationId || ""}
                            onChange={e => setSelectedStationId(parseInt(e.target.value))}
                          >
                            <option value="">Select a station...</option>
                            {stations.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                          </select>
                        </div>
                        <div>
                          <Label>Episode Title</Label>
                          <Input
                            placeholder="Episode title..."
                            value={scheduleForm.title}
                            onChange={e => setScheduleForm(p => ({ ...p, title: e.target.value }))}
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label>Date</Label>
                            <Input type="date" value={scheduleForm.date} onChange={e => setScheduleForm(p => ({ ...p, date: e.target.value }))} />
                          </div>
                          <div>
                            <Label>Start Time</Label>
                            <Input type="time" value={scheduleForm.startTime} onChange={e => setScheduleForm(p => ({ ...p, startTime: e.target.value }))} />
                          </div>
                        </div>
                        <div>
                          <Label>Duration</Label>
                          <select
                            className="w-full p-2 border rounded-lg bg-background"
                            value={scheduleForm.duration}
                            onChange={e => setScheduleForm(p => ({ ...p, duration: e.target.value }))}
                          >
                            <option value="30">30 minutes</option>
                            <option value="60">1 hour</option>
                            <option value="90">1.5 hours</option>
                            <option value="120">2 hours</option>
                          </select>
                        </div>
                        <div>
                          <Label>Description</Label>
                          <Textarea
                            placeholder="What will this episode cover?"
                            value={scheduleForm.description}
                            onChange={e => setScheduleForm(p => ({ ...p, description: e.target.value }))}
                          />
                        </div>
                        <Button
                          className="w-full"
                          onClick={() => scheduleShowMutation.mutate()}
                          disabled={!selectedStationId || !scheduleForm.title || !scheduleForm.date || !scheduleForm.startTime || scheduleShowMutation.isPending}
                        >
                          {scheduleShowMutation.isPending ? "Scheduling..." : "Schedule Show"}
                        </Button>
                      </>
                    )}
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          )}
        </div>

        <Tabs defaultValue="stations" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="stations">Stations</TabsTrigger>
            <TabsTrigger value="podcasts">Podcasts</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="stations" className="mt-6">
            {stations.length === 0 ? (
              <Card className="p-12 text-center">
                <RadioIcon className="h-12 w-12 mx-auto text-primary opacity-50 mb-4" />
                <h3 className="text-lg font-semibold mb-2">No stations yet</h3>
                <p className="text-muted-foreground mb-4">Be the first to create a radio station on SMOOCHES.</p>
                {user && (
                  <Button onClick={() => setIsCreateStationOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Station
                  </Button>
                )}
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {stations.map(station => (
                  <Card key={station.id} className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                        <RadioIcon className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{station.name}</h3>
                        <p className="text-sm text-muted-foreground">{station.description}</p>
                      </div>
                    </div>
                    <RadioPlayer station={station} />
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full mt-3"
                      onClick={() => { setSelectedStationId(station.id); setIsSchedulerOpen(true); }}
                    >
                      <CalendarPlus className="h-4 w-4 mr-2" />
                      Schedule Show
                    </Button>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="podcasts" className="mt-6">
            <Card className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="bg-primary/10 p-2 rounded-lg">
                    <RadioIcon className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">Your Podcast Channel</h3>
                    <p className="text-muted-foreground">Upload episodes as videos from the Create page</p>
                  </div>
                </div>
                {user && (
                  <Button className="gap-2" onClick={() => setLocation("/create")}>
                    <Upload className="h-4 w-4" />
                    Upload Episode
                  </Button>
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                Upload your podcast episodes as videos. Go to <Button variant="link" className="p-0 h-auto" onClick={() => setLocation("/create")}>Create</Button> to upload video content that your audience can watch and listen to.
              </p>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="mt-6">
            <Card className="p-6">
              <h3 className="text-xl font-bold mb-4">Station Analytics</h3>
              {stations.length === 0 ? (
                <p className="text-muted-foreground">Create a station to see analytics.</p>
              ) : (
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="p-4 bg-primary/10 rounded-lg text-center">
                    <div className="text-2xl font-bold">{stations.length}</div>
                    <div className="text-sm text-muted-foreground">Stations</div>
                  </div>
                  <div className="p-4 bg-secondary/10 rounded-lg text-center">
                    <div className="text-2xl font-bold">0</div>
                    <div className="text-sm text-muted-foreground">Live Listeners</div>
                  </div>
                  <div className="p-4 bg-accent/10 rounded-lg text-center">
                    <div className="text-2xl font-bold">0</div>
                    <div className="text-sm text-muted-foreground">Total Plays</div>
                  </div>
                </div>
              )}
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
}
