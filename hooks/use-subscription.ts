"use client";

import { useEffect, useState } from "react";
import { getUserInfo } from "@/lib/api-client";

interface SubscriptionStatus {
  isLoading: boolean;
  hasPaid: boolean;
  subscriptionStatus: "active" | "inactive" | "pending";
  subscriptionTier: "free" | "pro" | "basic";
  freeGenerationsUsed: number;
  freeGenerationsRemaining: number;
  credits: number;
  paymentDate?: string;
}

const FREE_GENERATION_LIMIT = 1;

export function useSubscription() {
  const [subscriptionStatus, setSubscriptionStatus] =
    useState<SubscriptionStatus>({
      isLoading: true,
      hasPaid: false,
      subscriptionStatus: "inactive",
      subscriptionTier: "free",
      freeGenerationsUsed: 0,
      freeGenerationsRemaining: FREE_GENERATION_LIMIT,
      credits: 0,
      paymentDate: undefined,
    });

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const info = await getUserInfo();
      
      setSubscriptionStatus({
        isLoading: false,
        hasPaid: info.credits > 5, // More than initial free credits means they've paid
        subscriptionStatus: info.credits > 0 ? "active" : "inactive",
        subscriptionTier: info.credits > 5 ? "pro" : "free",
        freeGenerationsUsed: info.free_generations_used,
        freeGenerationsRemaining: Math.max(0, FREE_GENERATION_LIMIT - info.free_generations_used),
        credits: info.credits,
        paymentDate: undefined,
      });
    } catch (error) {
      console.error("Failed to load user data:", error);
      setSubscriptionStatus(prev => ({ ...prev, isLoading: false }));
    }
  };

  const canGenerate = () => {
    return subscriptionStatus.credits > 0;
  };

  const shouldShowPaywall = () => {
    return subscriptionStatus.credits === 0;
  };

  const incrementFreeGeneration = async () => {
    // This is handled server-side now through the API
    await loadUserData();
  };

  const activateSubscription = async (tier: "pro" | "basic" = "pro") => {
    // This is handled through the payment modal and API
    await loadUserData();
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
            loadUserData();
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