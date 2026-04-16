import { Button } from "@/components/ui/button";

interface WelcomeStepProps {
  onNext: (data: any) => void;
}

export function WelcomeStep({ onNext }: WelcomeStepProps) {
  return (
    <div className="space-y-6 text-center">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tighter bg-gradient-to-r from-primary to-primary/50 bg-clip-text text-transparent">
          Welcome to SMOOCHES
        </h1>
        <p className="text-muted-foreground">
          Let's personalize your audio experience in just a few steps.
          We'll help you set up your preferences for the best possible experience.
        </p>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-lg bg-card border border-border">
            <h3 className="font-semibold mb-2">Personalized Audio</h3>
            <p className="text-sm text-muted-foreground">
              Customize your listening experience with quality settings
            </p>
          </div>
          <div className="p-4 rounded-lg bg-card border border-border">
            <h3 className="font-semibold mb-2">Discover Content</h3>
            <p className="text-sm text-muted-foreground">
              Find your favorite genres and creators
            </p>
          </div>
          <div className="p-4 rounded-lg bg-card border border-border">
            <h3 className="font-semibold mb-2">Stay Connected</h3>
            <p className="text-sm text-muted-foreground">
              Set up notifications for new content
            </p>
          </div>
        </div>
      </div>

      <Button 
        size="lg"
        className="w-full md:w-auto"
        onClick={() => onNext({})}
      >
        Let's Get Started
      </Button>
    </div>
  );
}
