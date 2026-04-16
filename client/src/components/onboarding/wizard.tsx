import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { WelcomeStep } from "./steps/welcome";
import { AudioPreferencesStep } from "./steps/audio-preferences";
import { GenreSelectionStep } from "./steps/genre-selection";
import { CreatorPreferencesStep } from "./steps/creator-preferences";
import { NotificationStep } from "./steps/notifications";

interface WizardProps {
  onComplete: () => void;
}

export function OnboardingWizard({ onComplete }: WizardProps) {
  const [step, setStep] = useState(0);
  const [preferences, setPreferences] = useState({
    audioQuality: "high",
    genres: [] as string[],
    creators: [] as number[],
    notifications: {
      newContent: true,
      liveBroadcasts: true,
      recommendations: true
    }
  });

  const steps = [
    WelcomeStep,
    AudioPreferencesStep,
    GenreSelectionStep,
    CreatorPreferencesStep,
    NotificationStep
  ];

  const CurrentStep = steps[step];
  const progress = ((step + 1) / steps.length) * 100;

  const handleNext = async (data: any) => {
    setPreferences(prev => ({ ...prev, ...data }));
    if (step === steps.length - 1) {
      try {
        // In the future, we can implement the API call to save preferences
        await Promise.resolve();
        onComplete();
      } catch (error) {
        console.error('Failed to save preferences:', error);
      }
    } else {
      setStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    setStep(prev => Math.max(0, prev - 1));
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl p-6 space-y-6">
        <Progress value={progress} className="w-full" />

        <CurrentStep 
          data={preferences}
          onNext={handleNext}
        />

        <div className="flex justify-between pt-4">
          {step > 0 && (
            <Button
              variant="outline"
              onClick={handleBack}
            >
              Back
            </Button>
          )}
          <div className="flex-1" />
          <span className="text-sm text-muted-foreground">
            Step {step + 1} of {steps.length}
          </span>
        </div>
      </Card>
    </div>
  );
}