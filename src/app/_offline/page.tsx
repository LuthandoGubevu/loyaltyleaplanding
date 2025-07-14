import { WifiOff } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function OfflinePage() {
  const handleRetry = () => {
    // Check if back navigation is possible, otherwise go to home
    if (window.history.length > 1) {
      window.history.back();
    } else {
      window.location.href = '/';
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background text-center p-4">
      <WifiOff className="w-24 h-24 text-primary mb-6" />
      <h1 className="text-4xl font-bold text-foreground mb-2">You're Offline</h1>
      <p className="text-lg text-muted-foreground mb-8 max-w-md">
        It seems you've lost your internet connection. Please check your network and try again.
      </p>
      <Button onClick={() => window.location.reload()} size="lg">
        Retry
      </Button>
    </div>
  );
}
