import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature")!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  switch (event.type) {
    case "payment_intent.succeeded":
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      const orderId = paymentIntent.metadata.orderId;
      
      await prisma.$transaction([
        prisma.order.update({
          where: { id: orderId },
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

    case "payment_intent.payment_failed":
      const failedIntent = event.data.object as Stripe.PaymentIntent;
      await prisma.order.update({
        where: { id: failedIntent.metadata.orderId },
        data: { status: "CANCELLED", paymentStatus: "FAILED" },
      });
      break;
  }

  return NextResponse.json({ received: true });
}