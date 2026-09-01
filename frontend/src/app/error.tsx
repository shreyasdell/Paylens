import { Button } from "@/components/ui/Button";
import { Link } from "next/link";
import { Home, RefreshCw } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background-950">
      <div className="text-center max-w-md">
        <h1 className="text-6xl font-bold text-white mb-4">500</h1>
        <p className="text-xl text-gray-400 mb-4">Something went wrong</p>
        <p className="text-gray-500 text-sm mb-8">{error.message}</p>
        <div className="flex gap-4 justify-center">
          <Button
            onClick={reset}
            className="flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Try Again
          </Button>
          <Link href="/">
            <Button variant="secondary" className="flex items-center gap-2">
              <Home className="h-4 w-4" />
              Go Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}