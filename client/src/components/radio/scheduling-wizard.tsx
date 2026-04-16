import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { TimeZoneStep } from "./steps/time-zone-step";
import { ScheduleStep } from "./steps/schedule-step";
import { RecurrenceStep } from "./steps/recurrence-step";
import { ReviewStep } from "./steps/review-step";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { RadioSchedule } from "@shared/schema";

interface SchedulingWizardProps {
  stationId: number;
  onComplete: () => void;
}

export function SchedulingWizard({ stationId, onComplete }: SchedulingWizardProps) {
  const [step, setStep] = useState(0);
  const { toast } = useToast();
  const [schedule, setSchedule] = useState({
    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    showName: "",
    description: "",
    startTime: new Date(),
    endTime: new Date(Date.now() + 3600000), // Default to 1 hour duration
    isRecurring: false,
    recurringDays: [] as string[]
  });

  const steps = [
    TimeZoneStep,
    ScheduleStep,
    RecurrenceStep,
    ReviewStep
  ];

  const CurrentStep = steps[step];
  const progress = ((step + 1) / steps.length) * 100;

  const handleNext = async (data: any) => {
    const updatedSchedule = { ...schedule, ...data };
    setSchedule(updatedSchedule);

    if (step === steps.length - 1) {
      try {
        // Ensure all required fields are present
        if (!updatedSchedule.showName || !updatedSchedule.description) {
          throw new Error("Show name and description are required");
        }

        // Convert dates to ISO strings
        await apiRequest('POST', '/api/radio-schedules', {
          stationId,
          showName: updatedSchedule.showName,
          description: updatedSchedule.description,
          startTime: updatedSchedule.startTime.toISOString(),
          endTime: updatedSchedule.endTime.toISOString(),
          isRecurring: updatedSchedule.isRecurring,
          recurringDays: updatedSchedule.recurringDays
        });

        toast({
          title: "Success",
          description: "Radio show scheduled successfully!",
        });

        onComplete();
      } catch (error) {
        toast({
          title: "Error",
          description: error instanceof Error ? error.message : "Failed to schedule radio show. Please try again.",
          variant: "destructive",
        });
      }
    } else {
      setStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    setStep(prev => Math.max(0, prev - 1));
  };

  return (
    <Card className="w-full max-w-2xl p-6 space-y-6">
      <Progress value={progress} className="w-full" />

      <CurrentStep 
        data={schedule}
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
  );
}