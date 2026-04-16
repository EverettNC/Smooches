import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface ChatMessageProps {
  username: string;
  content: string;
  timestamp: string;
  avatar?: string;
}

export function ChatMessage({ username, content, timestamp, avatar }: ChatMessageProps) {
  return (
    <div className="flex items-start gap-3 p-2 hover:bg-accent/50 rounded-lg">
      <Avatar className="w-8 h-8">
        {avatar ? (
          <AvatarImage src={avatar} alt={username} />
        ) : (
          <AvatarFallback>{username[0].toUpperCase()}</AvatarFallback>
        )}
      </Avatar>
      <div className="flex-1 space-y-1">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-sm">{username}</span>
          <span className="text-xs text-muted-foreground">
            {new Date(timestamp).toLocaleTimeString()}
          </span>
        </div>
        <p className="text-sm text-foreground/90">{content}</p>
      </div>
    </div>
  );
}
