// import { NextRequest, NextResponse } from "next/server";
// import Stripe from "stripe";
// import { getStripe } from "@/lib/stripe";
// import { prisma } from "@/lib/prisma";

// // 1. Force dynamic execution so Next.js doesn't try to static-analyze this route
// export const dynamic = "force-dynamic";
// export const runtime = "nodejs";
// export const revalidate = 0;

// export async function POST(request: NextRequest) {
//   // 2. Wrap everything in a try/catch to ensure we return a 500 instead of crashing the build
//   try {
//     const stripe = getStripe();
//     const body = await request.text();
//     const signature = request.headers.get("stripe-signature");

//     if (!signature) {
//       return NextResponse.json({ error: "Missing signature" }, { status: 400 });
//     }

//     const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
//     if (!webhookSecret) {
//       console.error("STRIPE_WEBHOOK_SECRET is missing");
//       return NextResponse.json({ error: "Server Configuration Error" }, { status: 500 });
//     }

//     const event = stripe.webhooks.constructEvent(body, signature, webhookSecret);

//     switch (event.type) {
//       case "payment_intent.succeeded": {
//         const intent = event.data.object as Stripe.PaymentIntent;
//         const orderId = intent.metadata?.orderId;

//         if (!orderId) throw new Error("Missing orderId");

//         await prisma.$transaction([
//           prisma.order.update({
//             where: { id: orderId },
//             data: { status: "PROCESSING", paymentStatus: "PAID", paidAt: new Date() },
//           }),
//           prisma.payment.create({
//             data: {
//               orderId,
//               amount: intent.amount / 100,
//               method: "CREDIT_CARD",
//               status: "PAID",
//               transactionId: intent.id,
//             },
//           }),
//         ]);
//         break;
//       }

//       case "payment_intent.payment_failed": {
//         const intent = event.data.object as Stripe.PaymentIntent;
//         const orderId = intent.metadata?.orderId;
//         if (orderId) {
//           await prisma.order.update({
//             where: { id: orderId },
//             data: { status: "CANCELLED", paymentStatus: "FAILED" },
//           });
//         }
//         break;
//       }
//     }

//     return NextResponse.json({ received: true }, { status: 200 });
//   } catch (error) {
//     console.error("[Webhook Error]:", error);
//     return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
//   }
// }