import { Button } from "@/components/ui/button";
import { format, addMinutes, differenceInMinutes } from "date-fns";
import { toDate } from "date-fns-tz";
import { CalendarDays, Clock, Globe, Pencil, Music, Repeat, Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";

interface ReviewStepProps {
  data: {
    timeZone: string;
    showName: string;
    description: string;
    startTime: Date;
    endTime: Date;
    isRecurring: boolean;
    recurringDays: string[];
  };
  onNext: (data: any) => void;
}

export function ReviewStep({ data, onNext }: ReviewStepProps) {
  // Convert UTC times to zoned times for display
  const zonedStartTime = toDate(data.startTime, { timeZone: data.timeZone });
  const zonedEndTime = toDate(data.endTime, { timeZone: data.timeZone });
  
  // Calculate duration in minutes
  const durationMinutes = differenceInMinutes(zonedEndTime, zonedStartTime);
  const hours = Math.floor(durationMinutes / 60);
  const minutes = durationMinutes % 60;
  const durationText = hours > 0 
    ? `${hours} ${hours === 1 ? 'hour' : 'hours'}${minutes > 0 ? ` ${minutes} min` : ''}` 
    : `${minutes} minutes`;

  // Format days for better display
  const formattedDays = data.recurringDays.map(day => {
    return day.charAt(0).toUpperCase() + day.slice(1);
  });

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-center">Almost Ready to Go Live!</h2>
        <p className="text-muted-foreground text-center">
          Review your show details and confirm to get started.
        </p>
      </div>

      <div className="relative bg-card border border-border/50 rounded-lg overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-primary/10 z-0"></div>
        
        {/* Top colored bar */}
        <div className="h-2 bg-gradient-to-r from-primary to-primary/70"></div>
        
        <div className="p-6 relative z-10">
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mr-4">
                <Music className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="text-xl font-bold">{data.showName}</h3>
                <p className="text-sm text-muted-foreground">
                  {format(zonedStartTime, "EEEE, MMMM d")}
                </p>
              </div>
            </div>
            
            <Badge variant="outline" className="border-primary/30 text-primary bg-primary/5">
              {data.isRecurring ? 'Recurring Show' : 'One-time Show'}
            </Badge>
          </div>
          
          <div className="space-y-4">
            <motion.div 
              className="flex items-start gap-3"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Clock className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">Show Time</p>
                <div className="flex gap-2 items-center mt-1">
                  <Badge variant="secondary" className="bg-accent/50 border-none text-foreground">
                    {format(zonedStartTime, "h:mm a")}
                  </Badge>
                  <span className="text-xs text-muted-foreground">to</span>
                  <Badge variant="secondary" className="bg-accent/50 border-none text-foreground">
                    {format(zonedEndTime, "h:mm a")}
                  </Badge>
                  <span className="ml-1 text-sm text-muted-foreground">({durationText})</span>
                </div>
              </div>
            </motion.div>
            
            <motion.div 
              className="flex items-start gap-3"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Globe className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">Time Zone</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {data.timeZone.replace(/_/g, " ")}
                </p>
              </div>
            </motion.div>
            
            {data.isRecurring && (
              <motion.div 
                className="flex items-start gap-3"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Repeat className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">Repeats On</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {formattedDays.map((day, i) => (
                      <Badge key={i} variant="outline" className="bg-primary/5 border-primary/20">
                        {day}
                      </Badge>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
            
            <motion.div 
              className="flex items-start gap-3"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Pencil className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">Description</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {data.description || "No description provided."}
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      <div className="flex justify-center pt-2">
        <Button
          onClick={() => onNext(data)}
          className="px-8 py-6 font-medium text-md rounded-full shadow-md hover:shadow-lg transition-all"
          size="lg"
        >
          <Check className="mr-2 h-5 w-5" />
          Confirm & Schedule Show
        </Button>
      </div>
    </div>
  );
}