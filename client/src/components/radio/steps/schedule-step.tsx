import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { format } from "date-fns";
import { toZonedTime } from "date-fns-tz";
import { Clock, CalendarCheck, Music, Calendar, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";
import { Card } from "@/components/ui/card";

interface ScheduleStepProps {
  data: {
    timeZone: string;
    showName: string;
    description: string;
    startTime: Date;
    endTime: Date;
  };
  onNext: (data: any) => void;
}

export function ScheduleStep({ data, onNext }: ScheduleStepProps) {
  const [showName, setShowName] = useState(data.showName);
  const [description, setDescription] = useState(data.description);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);

    const showName = formData.get("showName") as string;
    const description = formData.get("description") as string;
    const startTimeStr = formData.get("startTime") as string;
    const endTimeStr = formData.get("endTime") as string;

    // Create Date objects in the user's time zone
    const today = new Date();
    const [startHours, startMinutes] = startTimeStr.split(':').map(Number);
    const [endHours, endMinutes] = endTimeStr.split(':').map(Number);

    const startDate = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate(),
      startHours,
      startMinutes
    );

    const endDate = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate(),
      endHours,
      endMinutes
    );

    // If end time is earlier than start time, assume it's for the next day
    if (endDate < startDate) {
      endDate.setDate(endDate.getDate() + 1);
    }

    onNext({
      showName,
      description,
      startTime: startDate,
      endTime: endDate
    });
  };

  // Convert times to local timezone for display
  const localStartTime = toZonedTime(data.startTime, data.timeZone);
  const localEndTime = toZonedTime(data.endTime, data.timeZone);

  // Format times for display
  const startTimeStr = format(localStartTime, 'HH:mm');
  const endTimeStr = format(localEndTime, 'HH:mm');
  
  // Calculate duration display
  const getTimeDiffDisplay = () => {
    if (!showName || !startTimeStr || !endTimeStr) return "";
    
    const start = new Date();
    const [startHours, startMinutes] = startTimeStr.split(':').map(Number);
    start.setHours(startHours, startMinutes);
    
    const end = new Date();
    const [endHours, endMinutes] = endTimeStr.split(':').map(Number);
    end.setHours(endHours, endMinutes);
    
    // If end time is before start time, it's the next day
    if (end < start) {
      end.setDate(end.getDate() + 1);
    }
    
    const diffMs = end.getTime() - start.getTime();
    const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    let result = "";
    if (diffHrs > 0) {
      result += `${diffHrs} ${diffHrs === 1 ? 'hour' : 'hours'}`;
    }
    if (diffMins > 0) {
      if (result) result += " ";
      result += `${diffMins} min`;
    }
    
    return result;
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2 text-center mb-8">
        <h2 className="text-2xl font-bold">Create Your Show</h2>
        <p className="text-muted-foreground">
          What will your radio audience be tuning in to hear?
          <br />
          <span className="text-xs">All times in {data.timeZone.replace(/_/g, " ")}</span>
        </p>
      </div>

      <div className="grid gap-6">
        <motion.div 
          className="space-y-2"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Label 
            htmlFor="showName" 
            className="flex items-center gap-2 text-base font-medium"
          >
            <Music className="h-4 w-4 text-primary" />
            Show Name
          </Label>
          <Input
            id="showName"
            name="showName"
            placeholder="My Awesome Radio Show"
            defaultValue={data.showName}
            onChange={(e) => setShowName(e.target.value)}
            className="text-base py-6"
            required
          />
        </motion.div>

        <motion.div 
          className="space-y-2"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Label 
            htmlFor="description" 
            className="flex items-center gap-2 text-base font-medium"
          >
            <CalendarCheck className="h-4 w-4 text-primary" />
            Show Description
          </Label>
          <Textarea
            id="description"
            name="description"
            placeholder="What's your show about? Let other creators know what to expect!"
            defaultValue={data.description}
            onChange={(e) => setDescription(e.target.value)}
            className="resize-none min-h-[100px]"
            required
          />
        </motion.div>

        <motion.div 
          className="pt-2"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Label 
            className="flex items-center gap-2 text-base font-medium mb-2"
          >
            <Clock className="h-4 w-4 text-primary" />
            Show Time
          </Label>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startTime" className="text-sm text-muted-foreground">
                Start Time
              </Label>
              <Input
                id="startTime"
                name="startTime"
                type="time"
                defaultValue={startTimeStr}
                className="text-base font-medium"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="endTime" className="text-sm text-muted-foreground">
                End Time
              </Label>
              <Input
                id="endTime"
                name="endTime"
                type="time"
                defaultValue={endTimeStr}
                className="text-base font-medium"
                required
              />
            </div>
          </div>
        </motion.div>
      </div>
      
      {/* Preview Card */}
      {showName && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-8"
        >
          <Card className="p-4 bg-accent/20 border-primary/20">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Calendar className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-sm">{showName}</h4>
                <div className="flex items-center text-xs text-muted-foreground">
                  <span>Today,</span>
                  <span className="mx-1">{format(localStartTime, 'h:mm a')} - {format(localEndTime, 'h:mm a')}</span>
                  {getTimeDiffDisplay() && (
                    <span className="ml-1">({getTimeDiffDisplay()})</span>
                  )}
                </div>
              </div>
            </div>
            {description && (
              <p className="mt-2 text-xs text-muted-foreground line-clamp-2">{description}</p>
            )}
          </Card>
        </motion.div>
      )}

      <div className="flex justify-end pt-4">
        <Button 
          type="submit" 
          className="rounded-full px-6"
          size="lg"
        >
          Continue
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </form>
  );
}