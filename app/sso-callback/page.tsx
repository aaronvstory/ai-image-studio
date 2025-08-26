"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function SSOCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    // In demo mode or with Supabase, just redirect to dashboard
    setTimeout(() => {
      router.push("/dashboard");
    }, 1000);
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-950">
      <div className="text-center space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-purple-500 mx-auto" />
        <h1 className="text-xl font-semibold text-white">
          Completing sign in...
        </h1>
        <p className="text-sm text-zinc-400">
          Please wait while we redirect you.
        </p>
      </div>
    </div>
  );
}