import { ClipFeed } from '@/components/clip-feed';
import { Header } from '@/components/header';

export default function ClipsPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <ClipFeed />
      </main>
    </div>
  );
}