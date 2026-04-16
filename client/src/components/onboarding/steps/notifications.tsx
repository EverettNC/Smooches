import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface NotificationStepProps {
  data: {
    notifications?: {
      newContent: boolean;
      liveBroadcasts: boolean;
      recommendations: boolean;
    };
  };
  onNext: (data: any) => void;
}

export function NotificationStep({ data, onNext }: NotificationStepProps) {
  const notifications = data.notifications || {
    newContent: true,
    liveBroadcasts: true,
    recommendations: true
  };

  const updateNotification = (key: keyof typeof notifications, value: boolean) => {
    const updated = { ...notifications, [key]: value };
    onNext({ notifications: updated });
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold">Stay Updated</h2>
        <p className="text-muted-foreground">
          Choose how you want to stay informed about new content and activities.
          You can change these settings anytime.
        </p>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label htmlFor="new-content" className="flex flex-col gap-1">
            <span>New Content</span>
            <span className="font-normal text-sm text-muted-foreground">
              Get notified when creators you follow post new content
            </span>
          </Label>
          <Switch
            id="new-content"
            checked={notifications.newContent}
            onCheckedChange={(checked) => updateNotification('newContent', checked)}
          />
        </div>

        <div className="flex items-center justify-between">
          <Label htmlFor="live-broadcasts" className="flex flex-col gap-1">
            <span>Live Broadcasts</span>
            <span className="font-normal text-sm text-muted-foreground">
              Get notified when creators go live
            </span>
          </Label>
          <Switch
            id="live-broadcasts"
            checked={notifications.liveBroadcasts}
            onCheckedChange={(checked) => updateNotification('liveBroadcasts', checked)}
          />
        </div>

        <div className="flex items-center justify-between">
          <Label htmlFor="recommendations" className="flex flex-col gap-1">
            <span>Recommendations</span>
            <span className="font-normal text-sm text-muted-foreground">
              Get personalized content recommendations
            </span>
          </Label>
          <Switch
            id="recommendations"
            checked={notifications.recommendations}
            onCheckedChange={(checked) => updateNotification('recommendations', checked)}
          />
        </div>
      </div>

      <Button 
        className="w-full md:w-auto"
        onClick={() => onNext({ notifications })}
      >
        Complete Setup
      </Button>
    </div>
  );
}
