// app/api/webhook/route.ts
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const revalidate = 0;

export async function POST(request: NextRequest) {
  try {
    const { getPrismaClient } = await import("@/lib/prisma");
    const { getStripe } = await import("@/lib/stripe");

    // ✅ Both functions work fine without async imports
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

    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      webhookSecret
    );

    // ... rest of your webhook handling
    switch (event.type) {
      case "payment_intent.succeeded": {
        const intent = event.data.object;
        const orderId = intent.metadata?.orderId;

        if (!orderId) {
          return NextResponse.json(
            { error: "Missing orderId" },
            { status: 400 }
          );
        }

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
        break;
      }

      case "payment_intent.payment_failed": {
        const intent = event.data.object;
        const orderId = intent.metadata?.orderId;

        if (orderId) {
          await prisma.order.update({
            where: { id: orderId },
            data: {
              status: "CANCELLED",
              paymentStatus: "FAILED",
            },
          });
          console.log(`❌ Payment failed for order ${orderId}`);
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
        event: event.type 
      },
      { status: 200 }
    );
    
  } catch (error) {
    console.error("Webhook processing error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}