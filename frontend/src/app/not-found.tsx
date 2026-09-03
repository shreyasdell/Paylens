"use client";

import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { Home, RefreshCw } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background-950">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-white mb-4">404</h1>
        <p className="text-xl text-gray-400 mb-8">Page not found</p>
        <div className="flex gap-4 justify-center">
          <Link href="/">
            <Button className="flex items-center gap-2">
              <Home className="h-4 w-4" />
              Go Home
            </Button>
          </Link>
          <Button
            variant="secondary"
            onClick={() => window.location.reload()}
            className="flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>
    </div>
  );
}