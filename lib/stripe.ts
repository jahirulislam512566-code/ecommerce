// lib/stripe.ts
import Stripe from 'stripe';

let stripeInstance: Stripe | null = null;

export function getStripe(): Stripe {
  if (stripeInstance) return stripeInstance;

  const apiKey = process.env.STRIPE_SECRET_KEY;
  if (!apiKey) {
    throw new Error("STRIPE_SECRET_KEY is missing in environment variables.");
  }

  stripeInstance = new Stripe(apiKey, {
    // Update this string to match the requirement in your error message
    apiVersion: "2026-05-27.dahlia", 
    typescript: true,
  });

  return stripeInstance;
}