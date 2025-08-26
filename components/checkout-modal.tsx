"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CheckoutForm } from "./checkout-form";
import { useState, useEffect } from "react";
import { Sparkles, Lock, Zap, Shield } from "lucide-react";

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (paymentData: {
    success: boolean;
    message?: string;
    paymentId?: string;
  }) => void;
  trigger?: "generation-limit" | "upgrade-prompt" | "manual";
}

export function CheckoutModal({
  isOpen,
  onClose,
  onSuccess,
  trigger = "manual",
}: CheckoutModalProps) {
  // In demo mode, we don't have access to Clerk user
  const user = null;
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Only render modal after mounting to prevent hydration issues
  if (!mounted) {
    return null;
  }

  const getTitle = () => {
    if (trigger === "generation-limit") {
      return "🎨 Unlock Unlimited AI Generations";
    }
    if (trigger === "upgrade-prompt") {
      return "⚡ Upgrade to Pro";
    }
    return "Complete Your Purchase";
  };

  const getDescription = () => {
    if (trigger === "generation-limit") {
      return (
        <div className="space-y-3">
          <p className="text-sm text-zinc-300">
            You've used your free generation! Upgrade now for unlimited access.
          </p>
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-yellow-500" />
              <span className="text-sm text-zinc-200">
                Unlimited AI generations
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-purple-500" />
              <span className="text-sm text-zinc-200">
                HD quality & all sizes
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-blue-500" />
              <span className="text-sm text-zinc-200">Priority processing</span>
            </div>
            <div className="flex items-center gap-2">
              <Lock className="h-4 w-4 text-green-500" />
              <span className="text-sm text-zinc-200">
                Commercial use license
              </span>
            </div>
          </div>
        </div>
      );
    }

    if (trigger === "upgrade-prompt") {
      return (
        <p className="text-sm text-zinc-300">
          Get access to premium features and unlock the full potential of AI
          image generation.
        </p>
      );
    }

    return (
      <p className="text-sm text-zinc-300">
        Complete your payment securely to activate your subscription.
      </p>
    );
  };

  const handlePaymentSuccess = (paymentData: {
    success: boolean;
    message?: string;
    paymentId?: string;
  }) => {
    // Update user's metadata if payment is successful
    if (paymentData.success && user) {
      // In a real app, this would be handled server-side
      console.log("Payment successful, updating user metadata...");
    }

    // Call success handler
    onSuccess?.(paymentData);

    // Close modal after a short delay to show success message
    setTimeout(() => {
      onClose();
      // Refresh the page to update subscription status
      window.location.reload();
    }, 1500);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] bg-zinc-900 border-zinc-800 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-white">
            {getTitle()}
          </DialogTitle>
          <DialogDescription asChild>
            <div>{getDescription()}</div>
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4">
          <CheckoutForm
            onSuccess={handlePaymentSuccess}
            amount={29.99}
            productName="AI Image Generation Pro"
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
