import Stripe from 'stripe';

const globalForStripe = global as unknown as { stripe: Stripe | null };

export function getStripe(): Stripe {
  if (globalForStripe.stripe) return globalForStripe.stripe;

  const apiKey = process.env.STRIPE_SECRET_KEY;
  if (!apiKey) throw new Error("STRIPE_SECRET_KEY is missing.");

  // Update this line in lib/stripe.ts
globalForStripe.stripe = new Stripe(apiKey, {
  apiVersion: "2026-05-27.dahlia" as any, // Use 'as any' to bypass the strict type check
  typescript: true,
});

  return globalForStripe.stripe;
}