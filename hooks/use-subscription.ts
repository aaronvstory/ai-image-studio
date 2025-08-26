"use client";

import { useUser } from "@clerk/nextjs";
import { useEffect, useState } from "react";

interface SubscriptionStatus {
  isLoading: boolean;
  hasPaid: boolean;
  subscriptionStatus: "active" | "inactive" | "pending";
  subscriptionTier: "free" | "pro" | "basic";
  freeGenerationsUsed: number;
  freeGenerationsRemaining: number;
  paymentDate?: string;
}

const FREE_GENERATION_LIMIT = 1;

export function useSubscription() {
  const { user, isLoaded } = useUser();
  const [subscriptionStatus, setSubscriptionStatus] =
    useState<SubscriptionStatus>({
      isLoading: true,
      hasPaid: false,
      subscriptionStatus: "inactive",
      subscriptionTier: "free",
      freeGenerationsUsed: 0,
      freeGenerationsRemaining: FREE_GENERATION_LIMIT,
      paymentDate: undefined,
    });

  useEffect(() => {
    if (!isLoaded) {
      setSubscriptionStatus((prev) => ({ ...prev, isLoading: true }));
      return;
    }

    if (!user) {
      setSubscriptionStatus({
        isLoading: false,
        hasPaid: false,
        subscriptionStatus: "inactive",
        subscriptionTier: "free",
        freeGenerationsUsed: 0,
        freeGenerationsRemaining: FREE_GENERATION_LIMIT,
        paymentDate: undefined,
      });
      return;
    }

    // Extract subscription data from user metadata
    const metadata: any = (user as any)?.publicMetadata || {};
    const freeGenerationsUsed = metadata?.freeGenerationsUsed || 0;

    setSubscriptionStatus({
      isLoading: false,
      hasPaid: metadata?.hasPaid === true,
      subscriptionStatus: metadata?.subscriptionStatus || "inactive",
      subscriptionTier: metadata?.subscriptionTier || "free",
      freeGenerationsUsed,
      freeGenerationsRemaining: Math.max(
        0,
        FREE_GENERATION_LIMIT - freeGenerationsUsed
      ),
      paymentDate: metadata?.paymentDate,
    });
  }, [user, isLoaded]);

  const canGenerate = () => {
    return (
      subscriptionStatus.hasPaid ||
      subscriptionStatus.freeGenerationsRemaining > 0
    );
  };

  const shouldShowPaywall = () => {
    return (
      !subscriptionStatus.hasPaid &&
      subscriptionStatus.freeGenerationsUsed >= FREE_GENERATION_LIMIT
    );
  };

  const incrementFreeGeneration = async () => {
    if (!user || subscriptionStatus.hasPaid) return;

    const newCount = subscriptionStatus.freeGenerationsUsed + 1;

    try {
      // Update user metadata
      if (typeof (user as any).update === "function") {
        await (user as any).update({
          publicMetadata: {
            ...(user as any).publicMetadata,
            freeGenerationsUsed: newCount,
          },
        });
      }

      // Update local state
      setSubscriptionStatus((prev) => ({
        ...prev,
        freeGenerationsUsed: newCount,
        freeGenerationsRemaining: Math.max(0, FREE_GENERATION_LIMIT - newCount),
      }));
    } catch (error) {
      console.error("Failed to update free generation count:", error);
    }
  };

  const activateSubscription = async (tier: "pro" | "basic" = "pro") => {
    if (!user) return;

    try {
      // Update user metadata
      if (typeof (user as any).update === "function") {
        await (user as any).update({
          publicMetadata: {
            ...(user as any).publicMetadata,
            hasPaid: true,
            subscriptionStatus: "active",
            subscriptionTier: tier,
            paymentDate: new Date().toISOString(),
          },
        });
      }

      // Update local state
      setSubscriptionStatus((prev) => ({
        ...prev,
        hasPaid: true,
        subscriptionStatus: "active",
        subscriptionTier: tier,
        paymentDate: new Date().toISOString(),
      }));
    } catch (error) {
      console.error("Failed to activate subscription:", error);
    }
  };

  const openCheckoutModal = (
    trigger?: "generation-limit" | "upgrade-prompt" | "manual"
  ) => {
    window.dispatchEvent(
      new CustomEvent("openCheckoutModal", {
        detail: {
          trigger: trigger || "manual",
          onSuccess: () => {
            // Refresh subscription status after successful payment
            window.location.reload();
          },
        },
      })
    );
  };

  return {
    ...subscriptionStatus,
    canGenerate,
    shouldShowPaywall,
    incrementFreeGeneration,
    activateSubscription,
    openCheckoutModal,
  };
}
