"use client";

import { useEffect } from "react";
import { useSignIn, useSignUp } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function SSOCallbackPage() {
  const { signIn, setActive: setActiveSignIn } = useSignIn();
  const { signUp, setActive: setActiveSignUp } = useSignUp();
  const router = useRouter();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Try to handle sign-in callback first
        if (
          signIn?.status === "complete" &&
          setActiveSignIn &&
          signIn.createdSessionId
        ) {
          await setActiveSignIn({ session: signIn.createdSessionId });
          router.push("/dashboard");
          return;
        }

        // Then try sign-up callback
        if (
          signUp?.status === "complete" &&
          setActiveSignUp &&
          signUp.createdSessionId
        ) {
          await setActiveSignUp({ session: signUp.createdSessionId });
          router.push("/dashboard");
          return;
        }

        // If neither is complete, wait a bit and redirect
        setTimeout(() => {
          router.push("/dashboard");
        }, 2000);
      } catch (error) {
        console.error("SSO callback error:", error);
        // On error, redirect to home
        router.push("/");
      }
    };

    handleCallback();
  }, [signIn, signUp, setActiveSignIn, setActiveSignUp, router]);

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
