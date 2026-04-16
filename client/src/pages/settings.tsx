import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { 
  Shield, 
  Bell, 
  TrendingUp, 
  Eye, 
  EyeOff, 
  Users, 
  MessageCircle, 
  Heart,
  DollarSign,
  BarChart3,
  Settings as SettingsIcon
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth-simple";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

interface UserSettings {
  privacy: {
    profileVisible: boolean;
    allowMessages: boolean;
    allowFollows: boolean;
    showActivity: boolean;
  };
  notifications: {
    likes: boolean;
    comments: boolean;
    follows: boolean;
    mentions: boolean;
    liveStreams: boolean;
    emailNotifications: boolean;
  };
  creator: {
    analyticsEnabled: boolean;
    monetizationEnabled: boolean;
    autoApproveCollabs: boolean;
  };
}

export default function Settings() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [settings, setSettings] = useState<UserSettings>({
    privacy: {
      profileVisible: true,
      allowMessages: true,
      allowFollows: true,
      showActivity: true,
    },
    notifications: {
      likes: true,
      comments: true,
      follows: true,
      mentions: true,
      liveStreams: true,
      emailNotifications: false,
    },
    creator: {
      analyticsEnabled: true,
      monetizationEnabled: false,
      autoApproveCollabs: false,
    },
  });

  const updateSettingsMutation = useMutation({
    mutationFn: async (newSettings: UserSettings) => {
      const response = await fetch(`/api/users/${user?.id}/settings`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newSettings),
      });
      if (!response.ok) throw new Error("Failed to update settings");
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Settings Updated",
        description: "Your preferences have been saved successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Update Failed",
        description: "Failed to save your settings. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSettingChange = (category: keyof UserSettings, key: string, value: boolean) => {
    const newSettings = {
      ...settings,
      [category]: {
        ...settings[category],
        [key]: value,
      },
    };
    setSettings(newSettings);
    updateSettingsMutation.mutate(newSettings);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="container max-w-4xl mx-auto">
          <div className="text-center py-8">
            <p className="text-muted-foreground">Please log in to access settings</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="container max-w-4xl mx-auto">
        <div className="flex items-center gap-2 mb-6">
          <SettingsIcon className="h-6 w-6" />
          <h1 className="text-3xl font-bold">Settings</h1>
        </div>

        <Tabs defaultValue="privacy" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="privacy">Privacy</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="creator">Creator Tools</TabsTrigger>
          </TabsList>

          <TabsContent value="privacy" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Privacy Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label className="text-base font-medium">Profile Visibility</Label>
                    <p className="text-sm text-muted-foreground">
                      Allow others to find and view your profile
                    </p>
                  </div>
                  <Switch
                    checked={settings.privacy.profileVisible}
                    onCheckedChange={(checked) =>
                      handleSettingChange("privacy", "profileVisible", checked)
                    }
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label className="text-base font-medium">Direct Messages</Label>
                    <p className="text-sm text-muted-foreground">
                      Allow others to send you private messages
                    </p>
                  </div>
                  <Switch
                    checked={settings.privacy.allowMessages}
                    onCheckedChange={(checked) =>
                      handleSettingChange("privacy", "allowMessages", checked)
                    }
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label className="text-base font-medium">Follow Requests</Label>
                    <p className="text-sm text-muted-foreground">
                      Allow others to follow your content
                    </p>
                  </div>
                  <Switch
                    checked={settings.privacy.allowFollows}
                    onCheckedChange={(checked) =>
                      handleSettingChange("privacy", "allowFollows", checked)
                    }
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label className="text-base font-medium">Activity Status</Label>
                    <p className="text-sm text-muted-foreground">
                      Show when you're online and active
                    </p>
                  </div>
                  <Switch
                    checked={settings.privacy.showActivity}
                    onCheckedChange={(checked) =>
                      handleSettingChange("privacy", "showActivity", checked)
                    }
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Notification Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label className="text-base font-medium flex items-center gap-2">
                      <Heart className="h-4 w-4" />
                      Likes & Reactions
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Get notified when someone likes your content
                    </p>
                  </div>
                  <Switch
                    checked={settings.notifications.likes}
                    onCheckedChange={(checked) =>
                      handleSettingChange("notifications", "likes", checked)
                    }
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label className="text-base font-medium flex items-center gap-2">
                      <MessageCircle className="h-4 w-4" />
                      Comments
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Get notified about new comments on your posts
                    </p>
                  </div>
                  <Switch
                    checked={settings.notifications.comments}
                    onCheckedChange={(checked) =>
                      handleSettingChange("notifications", "comments", checked)
                    }
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label className="text-base font-medium flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      New Followers
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Get notified when someone follows you
                    </p>
                  </div>
                  <Switch
                    checked={settings.notifications.follows}
                    onCheckedChange={(checked) =>
                      handleSettingChange("notifications", "follows", checked)
                    }
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label className="text-base font-medium">Live Streams</Label>
                    <p className="text-sm text-muted-foreground">
                      Get notified when creators you follow go live
                    </p>
                  </div>
                  <Switch
                    checked={settings.notifications.liveStreams}
                    onCheckedChange={(checked) =>
                      handleSettingChange("notifications", "liveStreams", checked)
                    }
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label className="text-base font-medium">Email Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive notifications via email
                    </p>
                  </div>
                  <Switch
                    checked={settings.notifications.emailNotifications}
                    onCheckedChange={(checked) =>
                      handleSettingChange("notifications", "emailNotifications", checked)
                    }
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="creator" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Creator Tools
                  {(user.role === "creator" || user.role === "admin") && (
                    <Badge className="ml-2">Active</Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {user.role === "listener" && (
                  <div className="bg-muted/50 p-4 rounded-lg">
                    <p className="text-sm text-muted-foreground">
                      Upgrade to a Creator account to access analytics, monetization, and advanced features.
                    </p>
                    <Button
                      className="mt-2"
                      size="sm"
                      onClick={async () => {
                        const res = await fetch(`/api/users/${user.id}/upgrade`, { method: "POST", credentials: "include" });
                        if (res.ok) {
                          toast({ title: "Upgraded to Creator!", description: "You now have access to creator tools." });
                          queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
                        } else {
                          toast({ title: "Upgrade failed", variant: "destructive" });
                        }
                      }}
                    >
                      Upgrade to Creator
                    </Button>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label className="text-base font-medium flex items-center gap-2">
                      <BarChart3 className="h-4 w-4" />
                      Analytics Dashboard
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Track your content performance and audience insights
                    </p>
                  </div>
                  <Switch
                    checked={settings.creator.analyticsEnabled}
                    onCheckedChange={(checked) =>
                      handleSettingChange("creator", "analyticsEnabled", checked)
                    }
                    disabled={user.role === "listener"}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label className="text-base font-medium flex items-center gap-2">
                      <DollarSign className="h-4 w-4" />
                      Monetization
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Enable tips, subscriptions, and revenue features
                    </p>
                  </div>
                  <Switch
                    checked={settings.creator.monetizationEnabled}
                    onCheckedChange={(checked) =>
                      handleSettingChange("creator", "monetizationEnabled", checked)
                    }
                    disabled={user.role === "listener"}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label className="text-base font-medium">Auto-approve Collaborations</Label>
                    <p className="text-sm text-muted-foreground">
                      Automatically accept collaboration requests from verified creators
                    </p>
                  </div>
                  <Switch
                    checked={settings.creator.autoApproveCollabs}
                    onCheckedChange={(checked) =>
                      handleSettingChange("creator", "autoApproveCollabs", checked)
                    }
                    disabled={user.role === "listener"}
                  />
                </div>

                {(user.role === "creator" || user.role === "admin") && (
                  <div className="mt-6 p-4 bg-accent/20 rounded-lg">
                    <h4 className="font-medium mb-2">Creator Dashboard</h4>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div className="text-center">
                        <div className="font-semibold text-primary">{(user as any).followers || 0}</div>
                        <div className="text-muted-foreground">Followers</div>
                      </div>
                      <div className="text-center">
                        <div className="font-semibold text-primary">{(user as any).following || 0}</div>
                        <div className="text-muted-foreground">Following</div>
                      </div>
                      <div className="text-center">
                        <div className="font-semibold text-primary">Creator</div>
                        <div className="text-muted-foreground">Status</div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}