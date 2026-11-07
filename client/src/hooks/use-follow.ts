// Following a creator, the same way everywhere it appears (the For You video
// and the profile card). It reads whether the viewer already follows from the
// server, so the button is right when the page opens, and unfollows as the
// signed-in viewer (2026-11-06: the profile card unfollowed as user 0 and was
// always refused, and the video's Follow button did nothing).
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

interface FollowStatus {
  following: boolean;
  self: boolean;
  me: number;
}

async function readError(res: Response): Promise<string> {
  try {
    const body = await res.json();
    return body?.message || body?.error || `Error ${res.status}`;
  } catch {
    return `Error ${res.status}`;
  }
}

export function useFollow(creatorId: number | null | undefined, creatorName?: string) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const key = [`/api/follows/status/${creatorId}`];

  // null when signed out (the server answers 401).
  const { data: status } = useQuery<FollowStatus | null>({
    queryKey: key,
    enabled: !!creatorId,
  });

  const refresh = () => {
    qc.invalidateQueries({ queryKey: key });
    qc.invalidateQueries({ queryKey: [`/api/users/${creatorId}`] });
    if (status?.me) qc.invalidateQueries({ queryKey: [`/api/users/${status.me}`] });
  };

  const toggle = useMutation({
    mutationFn: async () => {
      if (!status) throw new Error("Sign in to follow creators");
      if (status.following) {
        const res = await fetch(`/api/follows/${status.me}/${creatorId}`, { method: "DELETE", credentials: "include" });
        if (!res.ok) throw new Error(await readError(res));
        return false;
      }
      const res = await fetch("/api/follows", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ followingId: creatorId }),
      });
      if (!res.ok) throw new Error(await readError(res));
      return true;
    },
    onSuccess: (nowFollowing) => {
      qc.setQueryData<FollowStatus | null>(key, (old) => (old ? { ...old, following: nowFollowing } : old));
      refresh();
      toast({ title: nowFollowing ? "Following!" : "Unfollowed", description: creatorName ? `@${creatorName}` : undefined });
    },
    onError: (err: Error) => {
      toast({ title: "Follow didn't go through", description: err.message, variant: "destructive" });
    },
  });

  return {
    signedIn: !!status,
    isSelf: !!status?.self,
    following: !!status?.following,
    busy: toggle.isPending,
    toggle: () => toggle.mutate(),
  };
}
