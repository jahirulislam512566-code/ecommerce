import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing stripe-signature header" }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  switch (event.type) {
    case "payment_intent.succeeded": {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      const orderId = paymentIntent.metadata.orderId;
      
      // Fixed: Enforce a runtime type guard to guarantee orderId is a strict string
      if (!orderId) {
        console.error(`[Webhook Error]: payment_intent.succeeded missed orderId in metadata. Intent ID: ${paymentIntent.id}`);
        return NextResponse.json({ error: "Missing orderId in metadata" }, { status: 400 });
      }
      
      await prisma.$transaction([
        prisma.order.update({
          where: { id: orderId }, // Fixed: Safe string guaranteed here
          data: { status: "PROCESSING", paymentStatus: "PAID", paidAt: new Date() },
        }),
        prisma.payment.create({
          data: {
            orderId,
            amount: paymentIntent.amount / 100,
            method: "CREDIT_CARD",
            status: "PAID",
            transactionId: paymentIntent.id,
          },
        }),
      ]);
      break;
    }

    case "payment_intent.payment_failed": {
      const failedIntent = event.data.object as Stripe.PaymentIntent;
      const orderId = failedIntent.metadata.orderId;

      if (!orderId) {
        console.error(`[Webhook Error]: payment_intent.payment_failed missed orderId in metadata. Intent ID: ${failedIntent.id}`);
        return NextResponse.json({ error: "Missing orderId in metadata" }, { status: 400 });
      }

      await prisma.order.update({
        where: { id: orderId }, // Fixed: Safe string guaranteed here
        data: { status: "CANCELLED", paymentStatus: "FAILED" },
      });
      break;
    }
  }

  return NextResponse.json({ received: true });
}