import { NextRequest, NextResponse } from "next/server";
import { auth, clerkClient, currentUser } from "@clerk/nextjs/server";
import { luhnCheck } from "@/lib/payment-utils";
import { markUserAsPaid } from "@/lib/user-metadata";

// Store payment data in memory (in production, use a database)
interface PaymentAttempt {
  id: string;
  userId: string;
  email: string;
  cardholderName: string;
  cardNumberLast4: string;
  cardType: string;
  amount: number;
  productName: string;
  billingAddress: {
    street: string;
    city: string;
    state: string;
    zip: string;
    country: string;
  };
  status: "success" | "failed";
  demo: boolean;
  timestamp: string;
  metadata: {
    cvv: string;
    expiryDate: string;
  };
  errorMessage?: string;
}

const paymentAttempts: PaymentAttempt[] = [];

export async function POST(request: NextRequest) {
  // NOTE: This endpoint is intentionally left in DEMO state.
  // It logs sensitive-like data and uses in-memory storage ON PURPOSE for educational/demo purposes.
  // Do NOT "harden" or remove without explicit product decision. Other production readiness tasks should skip altering this.
  try {
    const { userId } = await auth();
    const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE === 'true';

    if (!userId && !isDemoMode) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    // Log the payment attempt (development only for security)
    if (process.env.NODE_ENV === "development") {
      console.log("=== DEMO PAYMENT RECEIVED ===");
      console.log("User ID:", userId);
      console.log("Email:", body.email?.substring(0, 3) + "***");
      console.log("Cardholder:", body.cardholderName?.substring(0, 3) + "***");
      console.log("Card Number:", "****" + body.cardNumber?.slice(-4));
      console.log("Card Type:", body.cardType || "Unknown");
      console.log("Amount:", `$${body.amount}`);
      console.log("Product:", body.productName);
      console.log("=============================");
    }

    // Validate card number with Luhn algorithm
    if (!luhnCheck(body.cardNumber)) {
      return NextResponse.json(
        {
          error: "Invalid card number",
          message: "The card number failed Luhn validation",
        },
        { status: 400 }
      );
    }

    // Store the payment attempt
    const paymentRecord: PaymentAttempt = {
      id: `pay_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId: userId || (isDemoMode ? 'demo-user' : 'anonymous-user'),
      email: body.email,
      cardholderName: body.cardholderName,
      cardNumberLast4: body.cardNumber.replace(/\D/g, "").slice(-4),
      cardType: body.cardType,
      amount: body.amount,
      productName: body.productName,
      billingAddress: {
        street: body.billingAddress,
        city: body.city,
        state: body.state,
        zip: body.zipCode,
        country: body.country,
      },
      status: "success" as const,
      demo: true,
      timestamp: body.timestamp || new Date().toISOString(),
      metadata: {
        cvv: body.cvv || '',
        expiryDate: body.expiryDate || '', // In production, never store this
      },
    };

    paymentAttempts.push(paymentRecord);

    // Update user metadata in Clerk to mark as paid (skip in demo mode)
    if (userId && !isDemoMode) {
      try {
        await markUserAsPaid(userId, 'pro');
        if (process.env.NODE_ENV === "development") {
          console.log("Successfully updated user metadata for payment:", userId);
        }
      } catch (error) {
        if (process.env.NODE_ENV === "development") {
          console.error("Failed to update Clerk metadata:", error);
        }
        return NextResponse.json(
          { error: "Failed to update user subscription" },
          { status: 500 }
        );
      }
    } else if (isDemoMode && process.env.NODE_ENV === "development") {
      console.log("Demo mode: Skipping Clerk metadata update");
    }

    // Return success response
    return NextResponse.json({
      success: true,
      paymentId: paymentRecord.id,
      message: "Payment processed successfully (Demo Mode)",
      subscription: {
        status: "active",
        tier: "pro",
        validUntil: new Date(
          Date.now() + 30 * 24 * 60 * 60 * 1000
        ).toISOString(), // 30 days from now
      },
    });
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("Payment processing error:", error);
    }
    return NextResponse.json(
      {
        error: "Payment processing failed",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// GET endpoint to retrieve payment history (for admin/demo purposes)
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user's payment history
    const userPayments = paymentAttempts.filter((p) => p.userId === userId);

    return NextResponse.json({
      payments: userPayments,
      total: userPayments.length,
      message: "Demo payment history",
    });
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("Error fetching payments:", error);
    }
    return NextResponse.json(
      {
        error: "Failed to fetch payment history",
      },
      { status: 500 }
    );
  }
}
