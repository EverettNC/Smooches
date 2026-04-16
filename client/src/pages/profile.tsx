import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRoute } from "wouter";
import { UserProfile } from "@/components/user-profile";
import { VideoPlayer } from "@/components/video-player";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState } from "react";
import { useAuth } from "@/hooks/use-auth-simple";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Edit, Settings, Upload, Camera, X } from "lucide-react";
import type { Video, User } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";

const profileEditSchema = z.object({
  displayName: z.string().min(1, "Display name is required"),
  bio: z.string().optional(),
  location: z.string().optional(),
  website: z.string().url().optional().or(z.literal("")),
  avatar: z.string().optional(),
});

export default function Profile() {
  const [, params] = useRoute("/profile/:id");
  const { user } = useAuth();
  const userId = params?.id ? parseInt(params.id) : user?.id || 0;
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: profileUser } = useQuery<User>({
    queryKey: [`/api/users/${userId}`],
  });

  const { data: videos, isLoading } = useQuery<Video[]>({
    queryKey: [`/api/users/${userId}/videos`],
  });

  const isOwnProfile = user && user.id === userId;

  const form = useForm<z.infer<typeof profileEditSchema>>({
    resolver: zodResolver(profileEditSchema),
    defaultValues: {
      displayName: profileUser?.displayName || "",
      bio: profileUser?.bio || "",
      location: profileUser?.location || "",
      website: profileUser?.website || "",
      avatar: profileUser?.avatar || "",
    },
  });

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast({
          title: "File too large",
          description: "Please select an image under 5MB",
          variant: "destructive",
        });
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        setAvatarPreview(dataUrl);
        form.setValue("avatar", dataUrl);
      };
      reader.readAsDataURL(file);
    }
  };

  const updateProfileMutation = useMutation({
    mutationFn: async (data: z.infer<typeof profileEditSchema>) => {
      const response = await fetch(`/api/users/${userId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        throw new Error("Failed to update profile");
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Profile Updated",
        description: "Your profile has been successfully updated.",
      });
      queryClient.invalidateQueries({ queryKey: [`/api/users/${userId}`] });
      setIsEditOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Update Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: z.infer<typeof profileEditSchema>) => {
    updateProfileMutation.mutate(data);
  };

  return (
    <main className="min-h-screen bg-background">
      <div className="container max-w-4xl mx-auto py-8">
        <div className="flex items-center justify-between mb-6">
          <UserProfile userId={userId} detailed />
          {isOwnProfile && (
            <div className="flex gap-2">
              <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="gap-2">
                    <Edit className="h-4 w-4" />
                    Edit Profile
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Edit Profile</DialogTitle>
                  </DialogHeader>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                      {/* Avatar Upload */}
                      <div className="flex flex-col items-center space-y-4">
                        <div className="relative">
                          <Avatar className="w-20 h-20">
                            <AvatarImage 
                              src={avatarPreview || profileUser?.avatar || undefined} 
                              alt={profileUser?.displayName || "Profile"} 
                            />
                            <AvatarFallback className="text-lg">
                              {profileUser?.displayName?.charAt(0).toUpperCase() || "U"}
                            </AvatarFallback>
                          </Avatar>
                          <label 
                            htmlFor="avatar-upload" 
                            className="absolute bottom-0 right-0 bg-primary hover:bg-primary/90 text-primary-foreground rounded-full p-1 cursor-pointer"
                          >
                            <Camera className="w-3 h-3" />
                          </label>
                          <input
                            id="avatar-upload"
                            type="file"
                            accept="image/*"
                            onChange={handleAvatarUpload}
                            className="hidden"
                          />
                        </div>
                        <p className="text-xs text-muted-foreground text-center">
                          Click the camera icon to change your profile picture
                        </p>
                      </div>

                      <FormField
                        control={form.control}
                        name="displayName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Display Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Your display name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="bio"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Bio</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Tell us about yourself..." 
                                className="resize-none"
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="location"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Location</FormLabel>
                            <FormControl>
                              <Input placeholder="City, Country" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="website"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Website</FormLabel>
                            <FormControl>
                              <Input placeholder="https://yourwebsite.com" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <div className="flex justify-end gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setIsEditOpen(false)}
                        >
                          Cancel
                        </Button>
                        <Button 
                          type="submit"
                          disabled={updateProfileMutation.isPending}
                        >
                          {updateProfileMutation.isPending ? "Saving..." : "Save Changes"}
                        </Button>
                      </div>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </div>
          )}
        </div>

        <Tabs defaultValue="videos" className="mt-8">
          <TabsList>
            <TabsTrigger value="videos">Videos</TabsTrigger>
            <TabsTrigger value="live">Live</TabsTrigger>
            {isOwnProfile && <TabsTrigger value="settings">Settings</TabsTrigger>}
          </TabsList>

          <TabsContent value="videos">
            <ScrollArea className="h-[calc(100vh-16rem)]">
              {isLoading ? (
                <div className="grid grid-cols-2 gap-4">
                  {[1, 2, 3, 4].map((i) => (
                    <Skeleton key={i} className="aspect-[9/16]" />
                  ))}
                </div>
              ) : videos && videos.length > 0 ? (
                <div className="grid grid-cols-2 gap-4">
                  {videos.map((video) => (
                    <VideoPlayer key={video.id} video={video} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <p className="text-lg">No videos uploaded yet</p>
                  <p className="text-sm mt-2">Start creating content to share with your audience!</p>
                  {isOwnProfile && (
                    <Button className="mt-4 gap-2" variant="outline">
                      <Upload className="h-4 w-4" />
                      Upload Video
                    </Button>
                  )}
                </div>
              )}
            </ScrollArea>
          </TabsContent>

          <TabsContent value="live">
            <div className="text-center py-8 text-muted-foreground">
              <p className="text-lg">Live streaming coming soon</p>
              <p className="text-sm mt-2">Set up your live streaming schedule and go live!</p>
            </div>
          </TabsContent>

          {isOwnProfile && (
            <TabsContent value="settings">
              <Card>
                <CardHeader>
                  <CardTitle>Account Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <h4 className="font-medium">Privacy Settings</h4>
                    <p className="text-sm text-muted-foreground">
                      Manage who can see your content and interact with you
                    </p>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-medium">Notification Settings</h4>
                    <p className="text-sm text-muted-foreground">
                      Control what notifications you receive
                    </p>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-medium">Creator Tools</h4>
                    <p className="text-sm text-muted-foreground">
                      Access analytics, monetization, and creator features
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          )}

          <TabsContent value="live">
            <div className="text-center py-8 text-muted-foreground">
              No live streams available
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
}
