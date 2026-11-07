import { useQuery } from "@tanstack/react-query";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useFollow } from "@/hooks/use-follow";
import type { User } from "@shared/schema";

interface UserProfileProps {
  userId: number;
  detailed?: boolean;
}

export function UserProfile({ userId, detailed = false }: UserProfileProps) {
  const { data: user, isLoading } = useQuery<User>({
    queryKey: [`/api/users/${userId}`],
  });
  const follow = useFollow(userId, user?.username);

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

      {!follow.isSelf && (
        <Button variant={follow.following ? "outline" : "secondary"} size="sm" onClick={follow.toggle} disabled={follow.busy}>
          {follow.following ? "Following" : "Follow"}
        </Button>
      )}
    </div>
  );
}