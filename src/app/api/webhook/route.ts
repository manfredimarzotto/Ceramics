import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { createOrder } from "@/lib/orders";
import Stripe from "stripe";

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET || ""
    );
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;

    try {
      const lineItems = await stripe.checkout.sessions.listLineItems(session.id);

      await createOrder({
        items: lineItems.data.map((item) => ({
          productId: item.id,
          name: item.description || "Unknown",
          price: (item.amount_total || 0) / 100,
          quantity: item.quantity || 1,
        })),
        total: (session.amount_total || 0) / 100,
        customerEmail: session.customer_details?.email || "",
        customerName: session.customer_details?.name || "",
        shippingAddress: {
          line1: session.shipping_details?.address?.line1 || "",
          line2: session.shipping_details?.address?.line2 || undefined,
          city: session.shipping_details?.address?.city || "",
          state: session.shipping_details?.address?.state || "",
          postalCode: session.shipping_details?.address?.postal_code || "",
          country: session.shipping_details?.address?.country || "",
        },
        status: "confirmed",
        stripeSessionId: session.id,
      });
    } catch (error) {
      console.error("Failed to create order from webhook:", error);
      return NextResponse.json({ error: "Failed to process order" }, { status: 500 });
    }
  }

  return NextResponse.json({ received: true });
}
