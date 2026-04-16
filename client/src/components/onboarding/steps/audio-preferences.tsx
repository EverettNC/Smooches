import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { useState } from "react";

interface AudioPreferencesStepProps {
  data: {
    audioQuality?: string;
  };
  onNext: (data: any) => void;
}

export function AudioPreferencesStep({ data, onNext }: AudioPreferencesStepProps) {
  const [quality, setQuality] = useState(data.audioQuality || "high");
  const [volume, setVolume] = useState(80);

  const handleNext = () => {
    onNext({
      audioQuality: quality,
      defaultVolume: volume
    });
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold">Audio Preferences</h2>
        <p className="text-muted-foreground">
          Choose your preferred audio quality and default volume level.
          You can always change these settings later.
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-4">
          <Label>Streaming Quality</Label>
          <RadioGroup
            value={quality}
            onValueChange={setQuality}
            className="grid grid-cols-1 md:grid-cols-3 gap-4"
          >
            <Label
              htmlFor="auto"
              className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-card p-4 hover:bg-accent hover:text-accent-foreground [&:has([data-state=checked])]:border-primary"
            >
              <RadioGroupItem value="auto" id="auto" className="sr-only" />
              <h3 className="font-semibold">Auto</h3>
              <p className="text-sm text-muted-foreground">
                Adjusts based on your connection
              </p>
            </Label>
            <Label
              htmlFor="high"
              className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-card p-4 hover:bg-accent hover:text-accent-foreground [&:has([data-state=checked])]:border-primary"
            >
              <RadioGroupItem value="high" id="high" className="sr-only" />
              <h3 className="font-semibold">High</h3>
              <p className="text-sm text-muted-foreground">
                320kbps AAC encoding
              </p>
            </Label>
            <Label
              htmlFor="normal"
              className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-card p-4 hover:bg-accent hover:text-accent-foreground [&:has([data-state=checked])]:border-primary"
            >
              <RadioGroupItem value="normal" id="normal" className="sr-only" />
              <h3 className="font-semibold">Normal</h3>
              <p className="text-sm text-muted-foreground">
                128kbps AAC encoding
              </p>
            </Label>
          </RadioGroup>
        </div>

        <div className="space-y-4">
          <Label>Default Volume</Label>
          <Slider
            value={[volume]}
            onValueChange={(values) => setVolume(values[0])}
            max={100}
            step={1}
          />
          <div className="text-sm text-muted-foreground text-center">
            {volume}%
          </div>
        </div>
      </div>

      <Button 
        className="w-full md:w-auto"
        onClick={handleNext}
      >
        Continue
      </Button>
    </div>
  );
}
