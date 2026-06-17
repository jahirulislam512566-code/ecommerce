import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { getStripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  // 1. Initialize Stripe safely
  let stripe: Stripe;
  try {
    stripe = getStripe();
  } catch (error) {
    console.error("[Webhook Error]: Stripe initialization failed:", error);
    return NextResponse.json({ error: "Service Configuration Error" }, { status: 500 });
  }

  // 2. Extract raw body (Crucial: Do not use request.json())
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing stripe-signature header" }, { status: 400 });
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error("[Webhook Error]: STRIPE_WEBHOOK_SECRET is not defined.");
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }

  // 3. Verify Signature
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    console.error(`[Webhook Error]: Signature verification failed: ${err instanceof Error ? err.message : "Unknown error"}`);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  // 4. Process events
  try {
    switch (event.type) {
      case "payment_intent.succeeded": {
        const intent = event.data.object as Stripe.PaymentIntent;
        const orderId = intent.metadata?.orderId;

        if (!orderId) throw new Error(`Missing orderId for Intent: ${intent.id}`);

        await prisma.$transaction([
          prisma.order.update({
            where: { id: orderId },
            data: { status: "PROCESSING", paymentStatus: "PAID", paidAt: new Date() },
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
        break;
      }

      case "payment_intent.payment_failed": {
        const intent = event.data.object as Stripe.PaymentIntent;
        const orderId = intent.metadata?.orderId;

        if (!orderId) throw new Error(`Missing orderId for failed Intent: ${intent.id}`);

        await prisma.order.update({
          where: { id: orderId },
          data: { status: "CANCELLED", paymentStatus: "FAILED" },
        });
        break;
      }
    }
  } catch (error) {
    console.error(`[Webhook Error]: Database operation failed: ${error}`);
    return NextResponse.json({ error: "Internal Database Error" }, { status: 500 });
  }

  return NextResponse.json({ received: true }, { status: 200 });
}