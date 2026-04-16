import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

const DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday"
];

interface RecurrenceStepProps {
  data: {
    isRecurring: boolean;
    recurringDays: string[];
  };
  onNext: (data: any) => void;
}

export function RecurrenceStep({ data, onNext }: RecurrenceStepProps) {
  const handleRecurringChange = (checked: boolean) => {
    onNext({
      isRecurring: checked,
      recurringDays: checked ? data.recurringDays : []
    });
  };

  const handleDaysChange = (days: string[]) => {
    onNext({
      isRecurring: true,
      recurringDays: days
    });
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold">Set Recurrence</h2>
        <p className="text-muted-foreground">
          Choose if you want your show to repeat on specific days.
        </p>
      </div>

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Label htmlFor="recurring">Recurring Show</Label>
          <Switch
            id="recurring"
            checked={data.isRecurring}
            onCheckedChange={handleRecurringChange}
          />
        </div>

        {data.isRecurring && (
          <div className="space-y-4">
            <Label>Repeat on</Label>
            <ToggleGroup
              type="multiple"
              value={data.recurringDays}
              onValueChange={handleDaysChange}
              className="flex flex-wrap gap-2"
            >
              {DAYS.map((day) => (
                <ToggleGroupItem
                  key={day}
                  value={day}
                  variant="outline"
                  className="px-3 py-2"
                >
                  {day.slice(0, 3)}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </div>
        )}
      </div>

      <Button
        onClick={() => onNext({ isRecurring: data.isRecurring, recurringDays: data.recurringDays })}
        className="w-full md:w-auto"
      >
        Continue
      </Button>
    </div>
  );
}
