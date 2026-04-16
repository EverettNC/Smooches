import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import type { User } from "@shared/schema";

interface UserProfileProps {
  userId: number;
  detailed?: boolean;
}

export function UserProfile({ userId, detailed = false }: UserProfileProps) {
  const [isFollowing, setIsFollowing] = useState(false);
  const { toast } = useToast();

  const { data: user, isLoading } = useQuery<User>({
    queryKey: [`/api/users/${userId}`],
  });

  const handleFollow = async () => {
    try {
      if (isFollowing) {
        await fetch(`/api/follows/0/${userId}`, { method: "DELETE", credentials: "include" });
        setIsFollowing(false);
        toast({ title: "Unfollowed", description: `You unfollowed ${user?.displayName}` });
      } else {
        const res = await fetch("/api/follows", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ followingId: userId }),
        });
        if (res.status === 401) {
          toast({ title: "Sign in required", description: "You must be signed in to follow creators", variant: "destructive" });
          return;
        }
        setIsFollowing(true);
        toast({ title: "Following!", description: `You are now following ${user?.displayName}` });
      }
    } catch {
      toast({ title: "Error", description: "Something went wrong. Try again.", variant: "destructive" });
    }
  };

  if (isLoading) {
    return <Skeleton className="w-full h-12" />;
  }

  if (!user) {
    return (
      <div className="flex items-center gap-4 p-4">
        <Avatar className="w-12 h-12 border border-border">
          <AvatarFallback>U</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <h3 className="font-semibold text-white">User Not Found</h3>
          <p className="text-sm text-gray-300">@unknown</p>
        </div>
      </div>
    );
  }

  const getInitials = (name: string) => {
    return name.charAt(0).toUpperCase();
  };

  return (
    <div className={`flex items-center gap-4 ${detailed ? 'p-4' : ''}`}>
      <Avatar className="w-12 h-12 border border-border">
        {user.avatar ? (
          <AvatarImage src={user.avatar} alt={user.displayName} />
        ) : (
          <AvatarFallback>{getInitials(user.displayName)}</AvatarFallback>
        )}
      </Avatar>

      <div className="flex-1">
        <h3 className="font-semibold text-white">{user.displayName}</h3>
        <p className="text-sm text-gray-300">@{user.username}</p>
        {detailed && user.bio && (
          <p className="mt-2 text-gray-300">{user.bio}</p>
        )}
      </div>

      {detailed && (
        <div className="flex gap-4 text-center">
          <div>
            <p className="font-semibold text-white">{user.followers}</p>
            <p className="text-sm text-gray-300">Followers</p>
          </div>
          <div>
            <p className="font-semibold text-white">{user.following}</p>
            <p className="text-sm text-gray-300">Following</p>
          </div>
        </div>
      )}

      <Button variant={isFollowing ? "outline" : "secondary"} size="sm" onClick={handleFollow}>
        {isFollowing ? "Following" : "Follow"}
      </Button>
    </div>
  );
}