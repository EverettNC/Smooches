import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useQuery } from "@tanstack/react-query";
import type { User } from "@shared/schema";

interface CreatorPreferencesStepProps {
  data: {
    creators?: number[];
  };
  onNext: (data: any) => void;
}

export function CreatorPreferencesStep({ data, onNext }: CreatorPreferencesStepProps) {
  const { data: creators } = useQuery<User[]>({
    queryKey: ["/api/users"],
  });

  const selectedCreators = new Set(data.creators || []);

  const toggleCreator = (creatorId: number) => {
    const newSelected = new Set(selectedCreators);
    if (newSelected.has(creatorId)) {
      newSelected.delete(creatorId);
    } else {
      newSelected.add(creatorId);
    }
    onNext({ creators: Array.from(newSelected) });
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold">Follow Creators</h2>
        <p className="text-muted-foreground">
          Follow your favorite content creators to see their latest content in your feed.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {creators?.map((creator) => (
          <button
            key={creator.id}
            onClick={() => toggleCreator(creator.id)}
            className={`flex items-center gap-4 p-4 rounded-lg border-2 transition-all ${
              selectedCreators.has(creator.id)
                ? "border-primary bg-primary/10"
                : "border-border hover:border-primary/50"
            }`}
          >
            <Avatar className="w-12 h-12">
              {creator.avatar ? (
                <AvatarImage src={creator.avatar} alt={creator.username} />
              ) : (
                <AvatarFallback>
                  {creator.username[0].toUpperCase()}
                </AvatarFallback>
              )}
            </Avatar>
            <div className="text-left">
              <h3 className="font-medium">{creator.displayName}</h3>
              <p className="text-sm text-muted-foreground">@{creator.username}</p>
            </div>
          </button>
        ))}
      </div>

      <Button 
        className="w-full md:w-auto"
        onClick={() => onNext({ creators: Array.from(selectedCreators) })}
      >
        Continue
      </Button>
    </div>
  );
}
