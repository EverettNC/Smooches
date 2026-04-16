import { useState, useRef, useEffect } from 'react';
import WaveSurfer from 'wavesurfer.js';
import RegionsPlugin from 'wavesurfer.js/dist/plugins/regions';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { 
  Music, 
  Save, 
  Share, 
  Scissors, 
  Play, 
  Pause, 
  InfoIcon, 
  Clock, 
  ChevronRight,
  Sparkles,
  Copy,
  Wand2,
  Download,
  Instagram,
  Twitter
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { motion } from 'framer-motion';
import { Progress } from '@/components/ui/progress';

interface ClipGeneratorProps {
  audioUrl: string;
  showName: string;
  stationId: number;
  userId: number;
  onClipGenerated?: (clipUrl: string, thumbnailUrl: string) => void;
}

export function ClipGenerator({ audioUrl, showName, stationId, userId, onClipGenerated }: ClipGeneratorProps) {
  const waveformRef = useRef<HTMLDivElement>(null);
  const audioPlayerRef = useRef<HTMLAudioElement>(null);
  const wavesurfer = useRef<WaveSurfer | null>(null);
  const regionsPlugin = useRef<RegionsPlugin | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isGeneratingPreview, setIsGeneratingPreview] = useState(false);
  const [isSavingClip, setIsSavingClip] = useState(false);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [clipTitle, setClipTitle] = useState("");
  const [clipDescription, setClipDescription] = useState("");
  const [generatedClip, setGeneratedClip] = useState<{
    clipUrl: string;
    thumbnailUrl: string;
    duration: number;
    startTime: number;
    endTime: number;
  } | null>(null);
  const [previewData, setPreviewData] = useState<{
    waveform: string;
    duration: string;
  } | null>(null);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [currentRegion, setCurrentRegion] = useState<{start: number, end: number} | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (waveformRef.current) {
      const rPlugin = RegionsPlugin.create();
      regionsPlugin.current = rPlugin;

      wavesurfer.current = WaveSurfer.create({
        container: waveformRef.current,
        waveColor: 'rgba(var(--primary), 0.4)',
        progressColor: 'rgb(var(--primary))',
        cursorColor: 'rgb(var(--primary))',
        height: 100,
        barWidth: 2,
        barGap: 1,
        barRadius: 2,
        plugins: [rPlugin],
      });

      wavesurfer.current.load(audioUrl);

      wavesurfer.current.on('ready', () => {
        // Create an initial region of 30 seconds
        const duration = wavesurfer.current!.getDuration();
        const endTime = Math.min(30, duration);
        const region = rPlugin.addRegion({
          start: 0,
          end: endTime,
          color: 'rgba(var(--primary), 0.3)',
          drag: true,
          resize: true,
        });

        setCurrentRegion({
          start: 0,
          end: endTime
        });

        // Listen for region updates
        region.on('update-end', () => {
          setCurrentRegion({
            start: region.start,
            end: region.end
          });
        });

        // Enable drag-to-select new regions
        rPlugin.enableDragSelection({ color: 'rgba(var(--primary), 0.2)' });
      });

      wavesurfer.current.on('play', () => setIsPlaying(true));
      wavesurfer.current.on('pause', () => setIsPlaying(false));

      return () => {
        wavesurfer.current?.destroy();
      };
    }
  }, [audioUrl]);

  const handlePlayPause = () => {
    wavesurfer.current?.playPause();
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };
  
  const simulateProgressForDemo = () => {
    let progress = 0;
    const interval = setInterval(() => {
      progress += 5;
      setGenerationProgress(progress);
      if (progress >= 100) {
        clearInterval(interval);
      }
    }, 200);
    return interval;
  };

  const handleGeneratePreview = async () => {
    const regions = regionsPlugin.current?.getRegions() ?? [];
    const region = regions[0];

    if (!region) {
      toast({
        title: "Error",
        description: "Please select a portion of the audio to clip",
        variant: "destructive",
      });
      return;
    }

    if (region.end - region.start > 60) {
      toast({
        title: "Clip Too Long",
        description: "Clips must be 60 seconds or shorter. Please adjust your selection.",
        variant: "destructive",
      });
      return;
    }

    setIsGeneratingPreview(true);
    setGenerationProgress(0);
    
    // Start progress simulation
    const progressInterval = simulateProgressForDemo();
    
    try {
      // Generate preview data
      const duration = region.end - region.start;
      setPreviewData({
        waveform: 'preview-waveform',
        duration: formatDuration(duration)
      });

      // Generate the actual clip
      const res = await apiRequest('POST', '/api/clips/generate', {
        audioUrl,
        startTime: region.start,
        endTime: region.end,
        showName
      });
      const response: { clipUrl?: string; thumbnailUrl?: string; duration?: number } = await res.json();

      // Store the generated clip data
      setGeneratedClip({
        clipUrl: response.clipUrl || audioUrl,
        thumbnailUrl: response.thumbnailUrl || 'https://api.dicebear.com/7.x/shapes/svg?seed=clip',
        duration: response.duration || duration,
        startTime: region.start,
        endTime: region.end
      });

      setClipTitle(`${showName} - ${formatDuration(duration)} highlight`);

      toast({
        title: "Success",
        description: "Quick Preview created successfully!",
      });

      if (onClipGenerated) {
        onClipGenerated(
          response.clipUrl || audioUrl,
          response.thumbnailUrl || 'https://api.dicebear.com/7.x/shapes/svg?seed=clip'
        );
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate preview. Please try again.",
        variant: "destructive",
      });
    } finally {
      clearInterval(progressInterval);
      setGenerationProgress(100);
      setTimeout(() => {
        setIsGeneratingPreview(false);
      }, 500);
    }
  };

  const handleSaveClip = async () => {
    if (!generatedClip) {
      toast({
        title: "Error",
        description: "You need to generate a clip first",
        variant: "destructive",
      });
      return;
    }

    if (!clipTitle.trim()) {
      toast({
        title: "Error",
        description: "Please enter a title for your clip",
        variant: "destructive",
      });
      return;
    }

    setIsSavingClip(true);
    try {
      await apiRequest('POST', '/api/clips', {
        userId,
        stationId,
        showName,
        title: clipTitle,
        description: clipDescription,
        clipUrl: generatedClip.clipUrl,
        thumbnailUrl: generatedClip.thumbnailUrl,
        duration: generatedClip.duration,
        startTime: Math.round(generatedClip.startTime),
        endTime: Math.round(generatedClip.endTime),
        sourceUrl: audioUrl
      });

      toast({
        title: "Success",
        description: "Audio clip saved successfully!",
      });

      setSaveDialogOpen(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save the clip. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSavingClip(false);
    }
  };
  
  const handleShareClip = () => {
    if (!generatedClip) {
      toast({
        title: "Error",
        description: "You need to generate a clip first",
        variant: "destructive",
      });
      return;
    }
    
    setShareDialogOpen(true);
  };
  
  const handleCopyShareLink = () => {
    if (!generatedClip) return;
    
    navigator.clipboard.writeText(`https://smooches.app/clips/share/${Date.now()}`);
    
    toast({
      title: "Link Copied",
      description: "Share link copied to clipboard!",
    });
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex flex-col md:flex-row gap-4 items-start">
        <div className="w-full md:w-3/4 space-y-6">
          <Card className="p-6 space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold">Quick Preview Magic</h2>
                <p className="text-sm text-muted-foreground">Create bite-sized clips from your podcast</p>
              </div>
              <Badge variant="outline" className="px-3 py-1 bg-primary/10 text-primary border-primary/20">
                <Clock className="w-3 h-3 mr-1" />
                {currentRegion ? formatDuration(currentRegion.end - currentRegion.start) : "0:00"}
              </Badge>
            </div>
            
            <div 
              ref={waveformRef}
              className="w-full rounded-lg overflow-hidden bg-card border border-border/50 p-2"
            />
            
            <div className="flex-1 space-y-2">
              <p className="text-sm text-muted-foreground flex items-center">
                <InfoIcon className="w-3 h-3 mr-1 text-primary" />
                Drag to select the portion you want to clip (max 60 seconds)
              </p>
              
              <div className="flex items-center justify-between gap-4">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant={isPlaying ? "default" : "outline"}
                        size="icon"
                        onClick={handlePlayPause}
                        className="w-10 h-10 rounded-full"
                      >
                        {isPlaying ? (
                          <Pause className="w-4 h-4" />
                        ) : (
                          <Play className="w-4 h-4 ml-0.5" />
                        )}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{isPlaying ? "Pause" : "Play"}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <Button
                  onClick={handleGeneratePreview}
                  disabled={isGeneratingPreview}
                  className="flex-1 gap-2 bg-gradient-to-r from-primary to-primary-light hover:opacity-90"
                  size="lg"
                >
                  {isGeneratingPreview ? (
                    <>
                      <div className="w-full">
                        <div className="flex justify-between mb-1">
                          <span>Creating Preview</span>
                          <span>{generationProgress}%</span>
                        </div>
                        <Progress value={generationProgress} className="h-2" />
                      </div>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      Generate Quick Preview
                    </>
                  )}
                </Button>
              </div>
            </div>
          </Card>

          {previewData && generatedClip && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="p-6 space-y-4 border-primary/10 bg-accent/10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <Scissors className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold">Preview Ready</h3>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Clock className="w-3 h-3 mr-1" />
                        {previewData.duration}
                      </div>
                    </div>
                  </div>
                  
                  <Badge className="bg-green-500/10 text-green-500 hover:bg-green-500/20 border-none">
                    Ready to Share
                  </Badge>
                </div>
                
                {/* Audio player for the clip */}
                <div className="bg-background rounded-lg p-4 border border-border/50">
                  <div className="flex items-center justify-between gap-4 mb-3">
                    <div className="flex items-center gap-2">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 rounded-full bg-primary/10 text-primary hover:bg-primary/20"
                        onClick={() => {
                          if (audioPlayerRef.current) {
                            if (audioPlayerRef.current.paused) {
                              audioPlayerRef.current.play();
                            } else {
                              audioPlayerRef.current.pause();
                            }
                          }
                        }}
                      >
                        <Play className="w-4 h-4 ml-0.5" />
                      </Button>
                      <div className="text-sm font-medium truncate max-w-[200px]">
                        {clipTitle || `${showName} Clip`}
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm" className="h-7 text-xs gap-1 px-2">
                        <Download className="w-3 h-3" />
                        MP3
                      </Button>
                    </div>
                  </div>
                  
                  <audio ref={audioPlayerRef} src={generatedClip.clipUrl} className="w-full" controls />
                </div>
                
                <div className="flex space-x-3 pt-2">
                  <Button 
                    variant="default" 
                    className="flex-1 gap-2"
                    onClick={() => setSaveDialogOpen(true)}
                  >
                    <Save className="w-4 h-4" />
                    Save Clip
                  </Button>
                  <Button 
                    variant="outline" 
                    className="flex-1 gap-2"
                    onClick={handleShareClip}
                  >
                    <Share className="w-4 h-4" />
                    Share
                  </Button>
                </div>
              </Card>
            </motion.div>
          )}
        </div>
        
        {/* Right sidebar with tips */}
        <Card className="w-full md:w-1/4 p-4 space-y-4 bg-accent/10 border-border/50">
          <h3 className="font-medium flex items-center gap-2">
            <Wand2 className="w-4 h-4 text-primary" />
            Quick Preview Tips
          </h3>
          
          <div className="space-y-3">
            <div className="text-sm space-y-1">
              <p className="font-medium">1. Select the Best Part</p>
              <p className="text-muted-foreground text-xs">
                Choose compelling 15-30 second segments for better engagement.
              </p>
            </div>
            
            <div className="text-sm space-y-1">
              <p className="font-medium">2. Add Clear Titles</p>
              <p className="text-muted-foreground text-xs">
                Descriptive titles help clips get discovered.
              </p>
            </div>
            
            <div className="text-sm space-y-1">
              <p className="font-medium">3. Share Everywhere</p>
              <p className="text-muted-foreground text-xs">
                Post to social media to attract more listeners.
              </p>
            </div>
          </div>
          
          <div className="pt-2 space-y-2">
            <p className="text-xs text-muted-foreground">
              Creators who share clips get 3x more subscribers!
            </p>
            
            <div className="flex -space-x-2">
              <Avatar className="border-2 border-background w-6 h-6">
                <AvatarFallback>JD</AvatarFallback>
              </Avatar>
              <Avatar className="border-2 border-background w-6 h-6">
                <AvatarFallback>TK</AvatarFallback>
              </Avatar>
              <Avatar className="border-2 border-background w-6 h-6">
                <AvatarFallback>AR</AvatarFallback>
              </Avatar>
              <span className="flex items-center justify-center rounded-full w-6 h-6 bg-primary text-primary-foreground text-xs border-2 border-background">+9</span>
            </div>
          </div>
        </Card>
      </div>
      
      <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-xl">Save Your Audio Clip</DialogTitle>
          </DialogHeader>
          
          <div className="grid gap-6 py-4">
            <div className="space-y-2">
              <label htmlFor="clip-title" className="text-sm font-medium">
                Clip Title
              </label>
              <Input
                id="clip-title"
                value={clipTitle}
                onChange={(e) => setClipTitle(e.target.value)}
                placeholder="Give your clip a catchy title"
                className="w-full"
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="clip-description" className="text-sm font-medium flex items-center justify-between">
                <span>Description</span>
                <span className="text-xs text-muted-foreground">Helps with discovery</span>
              </label>
              <Textarea
                id="clip-description"
                value={clipDescription}
                onChange={(e) => setClipDescription(e.target.value)}
                placeholder="What's this clip about? Add context to help listeners understand."
                className="resize-none min-h-[100px]"
              />
            </div>
            
            <div className="p-3 rounded-lg bg-accent/30 text-sm">
              <p className="font-medium flex items-center gap-1 mb-2">
                <InfoIcon className="w-3 h-3 text-primary" />
                This clip will be saved to your library
              </p>
              <p className="text-muted-foreground text-xs">
                You can find all your clips in the Clips tab and share them any time.
              </p>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setSaveDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleSaveClip} 
              disabled={isSavingClip}
              className="gap-2"
            >
              {isSavingClip ? (
                <>Saving...</>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Save Clip
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-xl">Share Your Clip</DialogTitle>
          </DialogHeader>
          
          <div className="grid gap-6 py-4">
            <div className="p-3 bg-accent/20 rounded-lg">
              <div className="flex items-center gap-3 mb-3">
                {generatedClip && (
                  <div 
                    className="w-16 h-16 rounded-lg overflow-hidden bg-muted flex-shrink-0"
                    style={{
                      backgroundImage: `url(${generatedClip.thumbnailUrl})`,
                      backgroundSize: 'cover'
                    }}
                  />
                )}
                <div className="flex-1">
                  <h3 className="font-medium line-clamp-1">{clipTitle}</h3>
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {previewData?.duration}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-2 p-2 rounded-md bg-background border border-border">
                <input 
                  type="text" 
                  value="https://smooches.app/clips/share/12345" 
                  readOnly
                  className="flex-1 bg-transparent border-none text-sm focus:outline-none"
                />
                <Button variant="ghost" size="sm" onClick={handleCopyShareLink}>
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </div>
            
            <h4 className="font-medium text-sm">Share to Social Media</h4>
            
            <div className="grid grid-cols-2 gap-3">
              <Button variant="outline" className="gap-2 justify-start">
                <Instagram className="w-4 h-4 text-pink-500" />
                Instagram
              </Button>
              <Button variant="outline" className="gap-2 justify-start">
                <Twitter className="w-4 h-4 text-blue-400" />
                Twitter
              </Button>
            </div>
            
            <div className="p-3 rounded-lg bg-primary/10 text-sm">
              <p className="font-medium flex items-center gap-1 mb-1">
                <InfoIcon className="w-3 h-3 text-primary" />
                Tip: Boost Your Reach
              </p>
              <p className="text-muted-foreground text-xs">
                Add hashtags like #SmoochesApp #Podcast to increase your clip's visibility
              </p>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShareDialogOpen(false)}>
              Done
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}