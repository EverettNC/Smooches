import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

// A subset of common time zones for the demo
const TIME_ZONES = [
  "America/New_York",
  "America/Chicago",
  "America/Denver",
  "America/Los_Angeles",
  "Europe/London",
  "Europe/Paris",
  "Asia/Tokyo",
  "Asia/Dubai",
  "Australia/Sydney",
  "Pacific/Auckland"
].sort();

interface TimeZoneStepProps {
  data: {
    timeZone?: string;
  };
  onNext: (data: any) => void;
}

export function TimeZoneStep({ data, onNext }: TimeZoneStepProps) {
  const handleSubmit = () => {
    onNext({ timeZone: data.timeZone });
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold">Select Time Zone</h2>
        <p className="text-muted-foreground">
          Choose your time zone to ensure your radio show schedule is displayed correctly for all creators.
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label>Time Zone</Label>
          <Select
            value={data.timeZone}
            onValueChange={(value) => onNext({ timeZone: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select your time zone" />
            </SelectTrigger>
            <SelectContent>
              {TIME_ZONES.map((tz) => (
                <SelectItem key={tz} value={tz}>
                  {tz.replace(/_/g, " ")}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          {data.timeZone && (
            <p className="text-sm text-muted-foreground">
              Current time in {data.timeZone}:{" "}
              {new Date().toLocaleTimeString("en-US", { timeZone: data.timeZone })}
            </p>
          )}
        </div>
      </div>

      <Button
        className="w-full md:w-auto"
        onClick={handleSubmit}
      >
        Continue
      </Button>
    </div>
  );
}
