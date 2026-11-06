import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
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
  const isOwner = (user as any)?.role === "admin";

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

  const { data: saved } = useQuery<{ settings: Partial<UserSettings> | null }>({
    queryKey: [`/api/users/${user?.id}/settings`],
    enabled: !!user?.id,
  });

  useEffect(() => {
    const stored = saved?.settings;
    if (!stored) return;
    setSettings((current) => ({
      privacy: { ...current.privacy, ...(stored.privacy ?? {}) },
      notifications: { ...current.notifications, ...(stored.notifications ?? {}) },
      creator: { ...current.creator, ...(stored.creator ?? {}) },
    }));
  }, [saved]);

  const updateSettingsMutation = useMutation({
    mutationFn: async (newSettings: UserSettings) => {
      const response = await fetch(`/api/users/${user?.id}/settings`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
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
    onSettled: () => {
      // Show what is really stored, whether the save worked or not.
      queryClient.invalidateQueries({ queryKey: [`/api/users/${user?.id}/settings`] });
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
      <div className="min-h-screen p-4">
        <div className="container max-w-4xl mx-auto">
          <div className="text-center py-8">
            <p className="text-muted-foreground">Please log in to access settings</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4">
      <div className="container max-w-4xl mx-auto">
        <div className="flex items-center gap-2 mb-6">
          <SettingsIcon className="h-6 w-6" />
          <h1 className="text-3xl font-bold">Settings</h1>
        </div>

        <Tabs defaultValue="privacy" className="w-full">
          <TabsList className={`grid w-full ${isOwner ? "grid-cols-5" : "grid-cols-4"}`}>
            <TabsTrigger value="privacy">Privacy</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="creator">Creator Tools</TabsTrigger>
            <TabsTrigger value="account">Account</TabsTrigger>
            {isOwner && <TabsTrigger value="payments">Payments</TabsTrigger>}
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

          <TabsContent value="account" className="mt-6">
            <ChangePassword />
          </TabsContent>

          {isOwner && (
            <TabsContent value="payments" className="mt-6">
              <PaymentsSetup />
            </TabsContent>
          )}
        </Tabs>
      </div>
    </div>
  );
}

function ChangePassword() {
  const { toast } = useToast();
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [again, setAgain] = useState("");
  const [saving, setSaving] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (next !== again) {
      toast({ title: "Passwords don't match", description: "Type the new password the same way twice.", variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      const response = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ currentPassword: current, newPassword: next }),
      });
      const value = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(value.error || `Password was not changed (error ${response.status})`);
      setCurrent(""); setNext(""); setAgain("");
      toast({ title: "Password changed", description: "Everyone else signed in to this account has been signed out." });
    } catch (error: any) {
      toast({ title: "Password not changed", description: error.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Change password</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={submit} className="space-y-4 max-w-md">
          <div className="space-y-2">
            <Label htmlFor="current-password">Current password</Label>
            <Input id="current-password" type="password" autoComplete="current-password" value={current} onChange={(e) => setCurrent(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="new-password">New password (at least 10 characters)</Label>
            <Input id="new-password" type="password" autoComplete="new-password" value={next} onChange={(e) => setNext(e.target.value)} minLength={10} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="new-password-again">New password again</Label>
            <Input id="new-password-again" type="password" autoComplete="new-password" value={again} onChange={(e) => setAgain(e.target.value)} minLength={10} required />
          </div>
          <Button type="submit" disabled={saving}>{saving ? "Saving..." : "Change password"}</Button>
        </form>
      </CardContent>
    </Card>
  );
}
function PaymentsSetup() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [key, setKey] = useState("");
  const [saving, setSaving] = useState(false);
  const { data: status } = useQuery<{ configured: boolean; mode?: string; keyEnd?: string; vault?: boolean }>({
    queryKey: ["/api/admin/payments"],
  });

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const response = await fetch("/api/admin/payments/key", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ key }),
      });
      const value = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(value.error || `The key was not saved (error ${response.status})`);
      setKey("");
      queryClient.invalidateQueries({ queryKey: ["/api/admin/payments"] });
      toast({ title: "Stripe connected", description: "The key is locked in the vault. It won't be shown again." });
    } catch (error: any) {
      toast({ title: "Stripe not connected", description: error.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Payments</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground" role="status">
          {status?.configured
            ? `Stripe is connected (${status.mode === "live" ? "real payments" : "test mode"}), key ending ${status.keyEnd}.`
            : "Stripe is not connected yet."}
        </p>
        <form onSubmit={save} className="space-y-4 max-w-md">
          <div className="space-y-2">
            <Label htmlFor="stripe-key">{status?.configured ? "Replace the Stripe key" : "Stripe restricted key"}</Label>
            <Input id="stripe-key" type="password" autoComplete="off" spellCheck={false} value={key}
                   onChange={(e) => setKey(e.target.value)} placeholder="rk_live_..." required />
          </div>
          <Button type="submit" disabled={saving || !key.trim()}>{saving ? "Checking with Stripe..." : "Connect Stripe"}</Button>
        </form>
      </CardContent>
    </Card>
  );
}
