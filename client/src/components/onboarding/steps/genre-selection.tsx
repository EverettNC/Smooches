import { Button } from "@/components/ui/button";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

interface GenreSelectionStepProps {
  data: {
    genres?: string[];
  };
  onNext: (data: any) => void;
}

export function GenreSelectionStep({ data, onNext }: GenreSelectionStepProps) {
  const genres = [
    "Pop", "Rock", "Hip Hop", "R&B", "Jazz",
    "Classical", "Electronic", "Folk", "Country", "Metal"
  ];

  const handleNext = () => {
    onNext({
      genres: data.genres
    });
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold">Music Preferences</h2>
        <p className="text-muted-foreground">
          Select your favorite music genres to help us personalize your experience.
          You can select multiple genres.
        </p>
      </div>

      <div className="space-y-4">
        <ToggleGroup 
          type="multiple"
          value={data.genres}
          onValueChange={(value) => onNext({ genres: value })}
          className="flex flex-wrap gap-2"
        >
          {genres.map((genre) => (
            <ToggleGroupItem
              key={genre}
              value={genre}
              variant="outline"
              className="rounded-full px-4 py-2"
            >
              {genre}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </div>

      <Button 
        className="w-full md:w-auto"
        onClick={handleNext}
      >
        Continue
      </Button>
    </div>
  );
}
