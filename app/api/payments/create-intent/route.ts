import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Stripe from "stripe";

// Initialize Stripe properly
const stripe = process.env.STRIPE_SECRET_KEY 
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2025-02-24.acacia", // Adjusted to match standard typed API versions
    })
  : null;

export async function POST(request: NextRequest) {
  try {
    console.log("=== Payment Intent API Called ===");
    
    // Check if Stripe is configured
    if (!stripe) {
      console.error("Stripe is not configured. Please add STRIPE_SECRET_KEY to your .env file");
      return NextResponse.json(
        { error: "Payment service is not configured. Please use COD instead." },
        { status: 400 }
      );
    }

    const session = await getServerSession(authOptions);
    console.log("Session user:", session?.user?.email || "Guest");
    
    // Parse request body
    let body;
    try {
      body = await request.json();
    } catch (error) {
      console.error("Failed to parse request body:", error);
      return NextResponse.json(
        { error: "Invalid request body" },
        { status: 400 }
      );
    }
    
    const { orderId } = body;
    console.log("Order ID:", orderId);

    if (!orderId) {
      console.error("No order ID provided");
      return NextResponse.json(
        { error: "Order ID is required" },
        { status: 400 }
      );
    }

    // Get order details
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!order) {
      console.error("Order not found:", orderId);
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      );
    }

    console.log("Order found:", order.orderNumber);
    console.log("Order total from DB:", order.total);

    // Convert total to cents (Stripe requires integer amounts)
    // If order.total is 15.50, amount is 1550 cents.
    const amountInCents = Math.round(order.total * 100);
    console.log("Calculated amount in cents:", amountInCents);
    
    if (amountInCents <= 0) {
      console.error("Invalid order amount in cents:", amountInCents);
      return NextResponse.json(
        { error: "Invalid order amount" },
        { status: 400 }
      );
    }

    // Create Stripe Payment Intent
    console.log("Creating Stripe payment intent...");
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents, // FIXED: Using the calculated integer directly without double-multiplying
      currency: "usd",
      
      metadata: {
        orderId: order.id,
        // Safe string conversion for metadata values
        orderNumber: order.orderNumber ? order.orderNumber.toString() : "",
        userId: session?.user?.id || "guest",
      },
      
      // Handled safely: if email is empty string or null, fallback to undefined so Stripe ignores it
      receipt_email: session?.user?.email || undefined, 
      
      automatic_payment_methods: {
        enabled: true,
        allow_redirects: "always", // Supports 3D Secure verification steps safely
      },
    });

    console.log("Payment intent created:", paymentIntent.id);
    console.log("Client secret:", paymentIntent.client_secret ? "Yes" : "No");

    // Update order with payment intent ID
    await prisma.order.update({
      where: { id: order.id },
      data: { paymentIntentId: paymentIntent.id },
    });

    console.log("Order updated with payment intent ID");

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    });
  } catch (error) {
    console.error("Error creating payment intent:", error);
    
    // Handle Stripe specific errors
    if (error instanceof Stripe.errors.StripeError) {
      console.error("Stripe error details:", {
        type: error.type,
        code: error.code,
        message: error.message,
      });
      return NextResponse.json(
        { 
          error: error.message,
          type: error.type,
          code: error.code,
        },
        { status: 400 }
      );
    }
    
    // Handle general errors
    const errorMessage = error instanceof Error ? error.message : "Failed to create payment intent";
    
    return NextResponse.json(
      { 
        error: errorMessage,
        ...(process.env.NODE_ENV === "development" && { 
          stack: error instanceof Error ? error.stack : undefined 
        })
      },
      { status: 500 }
    );
  }
}