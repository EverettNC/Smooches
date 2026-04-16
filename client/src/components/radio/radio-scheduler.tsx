import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { CalendarIcon, Clock, Plus, X } from "lucide-react";
import { format, addDays, startOfWeek } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";

interface RadioSchedulerProps {
  stationId: number;
  onScheduleCreated?: () => void;
}

export function RadioScheduler({ stationId, onScheduleCreated }: RadioSchedulerProps) {
  const [showName, setShowName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("10:00");
  const [isRecurring, setIsRecurring] = useState(false);
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [category, setCategory] = useState("");
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  const categories = ["Music", "Talk", "News", "Sports", "Entertainment", "Educational"];

  const createScheduleMutation = useMutation({
    mutationFn: async (scheduleData: any) => {
      const response = await fetch("/api/radio-schedules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(scheduleData),
      });
      if (!response.ok) throw new Error("Failed to create schedule");
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Show Scheduled",
        description: "Your radio show has been successfully scheduled.",
      });
      queryClient.invalidateQueries({ queryKey: [`/api/radio-stations/${stationId}/schedules`] });
      onScheduleCreated?.();
      resetForm();
    },
    onError: (error) => {
      toast({
        title: "Scheduling Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setShowName("");
    setDescription("");
    setSelectedDate(new Date());
    setStartTime("09:00");
    setEndTime("10:00");
    setIsRecurring(false);
    setSelectedDays([]);
    setCategory("");
  };

  const toggleDay = (day: string) => {
    setSelectedDays(prev => 
      prev.includes(day) 
        ? prev.filter(d => d !== day)
        : [...prev, day]
    );
  };

  const handleSubmit = () => {
    if (!showName || !description || !category) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    const scheduleData = {
      stationId,
      showName,
      description,
      category,
      startDate: selectedDate,
      startTime,
      endTime,
      isRecurring,
      recurringDays: isRecurring ? selectedDays : [],
    };

    createScheduleMutation.mutate(scheduleData);
  };

  const getNextWeekDates = () => {
    const today = new Date();
    const weekStart = startOfWeek(today, { weekStartsOn: 1 });
    return Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CalendarIcon className="h-5 w-5" />
          Schedule Radio Show
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Basic Information */}
        <div className="space-y-4">
          <div>
            <Label htmlFor="showName">Show Name *</Label>
            <Input
              id="showName"
              value={showName}
              onChange={(e) => setShowName(e.target.value)}
              placeholder="Enter your show name"
            />
          </div>
          
          <div>
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your show..."
              className="resize-none"
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="category">Category *</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat.toLowerCase()}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Date and Time */}
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Start Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {format(selectedDate, "PPP")}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={(date) => date && setSelectedDate(date)}
                    disabled={(date) => date < new Date()}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="startTime">Start Time</Label>
              <Input
                id="startTime"
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="endTime">End Time</Label>
              <Input
                id="endTime"
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Recurring Options */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="recurring"
              checked={isRecurring}
              onChange={(e) => setIsRecurring(e.target.checked)}
              className="rounded border-gray-300"
            />
            <Label htmlFor="recurring">Make this a recurring show</Label>
          </div>

          {isRecurring && (
            <div>
              <Label>Select Days</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {days.map((day) => (
                  <Badge
                    key={day}
                    variant={selectedDays.includes(day) ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => toggleDay(day)}
                  >
                    {day.slice(0, 3)}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Quick Schedule Suggestions */}
        <div className="space-y-2">
          <Label>Quick Schedule</Label>
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setStartTime("06:00");
                setEndTime("09:00");
                setIsRecurring(true);
                setSelectedDays(["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]);
              }}
            >
              Morning Show (6-9 AM)
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setStartTime("15:00");
                setEndTime("18:00");
                setIsRecurring(true);
                setSelectedDays(["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]);
              }}
            >
              Afternoon Drive (3-6 PM)
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setStartTime("20:00");
                setEndTime("22:00");
                setIsRecurring(false);
                setSelectedDays(["Friday", "Saturday"]);
              }}
            >
              Weekend Nights (8-10 PM)
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setStartTime("12:00");
                setEndTime("13:00");
                setIsRecurring(true);
                setSelectedDays(["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]);
              }}
            >
              Lunch Hour (12-1 PM)
            </Button>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={resetForm}>
            Clear
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={createScheduleMutation.isPending}
            className="bg-primary hover:bg-primary/90"
          >
            {createScheduleMutation.isPending ? "Scheduling..." : "Schedule Show"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}