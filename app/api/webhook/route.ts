// app/api/webhook/route.ts
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const revalidate = 0;

export async function POST(request: NextRequest) {
  // ✅ Completely isolate all imports inside the try block
  try {
    // ✅ Import everything dynamically - including the Stripe and Prisma types
    const { default: Stripe } = await import("stripe");
    const { getPrismaClient } = await import("@/lib/prisma");
    const { getStripe } = await import("@/lib/stripe");

    // ✅ Get the instances
    const stripe = getStripe();
    const prisma = getPrismaClient();

    const body = await request.text();
    const signature = request.headers.get("stripe-signature");

    if (!signature) {
      return NextResponse.json(
        { error: "Missing stripe-signature header" },
        { status: 400 }
      );
    }

    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!webhookSecret) {
      console.error("STRIPE_WEBHOOK_SECRET is not configured");
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 }
      );
    }

    // ✅ Verify the webhook signature
    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      console.error("Webhook signature verification failed:", err);
      return NextResponse.json(
        { error: "Invalid signature" },
        { status: 400 }
      );
    }

    // ✅ Handle the webhook event
    switch (event.type) {
      case "payment_intent.succeeded": {
        const intent = event.data.object as Stripe.PaymentIntent;
        const orderId = intent.metadata?.orderId;

        if (!orderId) {
          console.error("Payment intent missing orderId metadata");
          return NextResponse.json(
            { error: "Missing orderId in payment intent" },
            { status: 400 }
          );
        }

        try {
          await prisma.$transaction([
            prisma.order.update({
              where: { id: orderId },
              data: {
                status: "PROCESSING",
                paymentStatus: "PAID",
                paidAt: new Date(),
              },
            }),
            prisma.payment.create({
              data: {
                orderId,
                amount: intent.amount / 100,
                method: "CREDIT_CARD",
                status: "PAID",
                transactionId: intent.id,
              },
            }),
          ]);
          console.log(`✅ Payment succeeded for order ${orderId}`);
        } catch (dbError) {
          console.error(`Database error for order ${orderId}:`, dbError);
          return NextResponse.json(
            { error: "Database error" },
            { status: 500 }
          );
        }
        break;
      }

      case "payment_intent.payment_failed": {
        const intent = event.data.object as Stripe.PaymentIntent;
        const orderId = intent.metadata?.orderId;

        if (orderId) {
          try {
            await prisma.order.update({
              where: { id: orderId },
              data: {
                status: "CANCELLED",
                paymentStatus: "FAILED",
              },
            });
            console.log(`❌ Payment failed for order ${orderId}`);
          } catch (dbError) {
            console.error(`Database error for order ${orderId}:`, dbError);
          }
        }
        break;
      }

      default: {
        console.log(`⚠️ Unhandled event type: ${event.type}`);
      }
    }

    return NextResponse.json(
      {
        received: true,
        event: event.type,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("[Webhook Error]:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}