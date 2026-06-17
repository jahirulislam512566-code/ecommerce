// lib/stripe.ts
import Stripe from "stripe";

let stripeInstance: Stripe | null = null;

export function getStripe() {
  if (!stripeInstance) {
    const secretKey = process.env.STRIPE_SECRET_KEY;
    if (!secretKey) {
      throw new Error("STRIPE_SECRET_KEY is not set");
    }
    
    // ✅ Don't specify apiVersion - use the default
    stripeInstance = new Stripe(secretKey, {
      typescript: true,
    });
  }
  return stripeInstance;
}

export default { getStripe };