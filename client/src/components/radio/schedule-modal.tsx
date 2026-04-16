import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { SchedulingWizard } from "./scheduling-wizard";
import { CalendarPlus } from "lucide-react";

interface ScheduleModalProps {
  stationId: number;
  onScheduleCreated: () => void;
}

export function ScheduleModal({ stationId, onScheduleCreated }: ScheduleModalProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <CalendarPlus className="h-4 w-4" />
          Schedule Show
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl">
        <SchedulingWizard
          stationId={stationId}
          onComplete={onScheduleCreated}
        />
      </DialogContent>
    </Dialog>
  );
}
