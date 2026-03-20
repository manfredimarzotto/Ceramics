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

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error("STRIPE_WEBHOOK_SECRET is not configured");
    return NextResponse.json({ error: "Webhook not configured" }, { status: 500 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      webhookSecret
    );
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;

    try {
      const lineItems = await stripe.checkout.sessions.listLineItems(session.id, {
        expand: ["data.price.product"],
      });

      const orderItems = lineItems.data
        .filter((item) => {
          const product = item.price?.product as Stripe.Product | undefined;
          return product?.name !== "Shipping";
        })
        .map((item) => {
          const product = item.price?.product as Stripe.Product | undefined;
          return {
            productId: product?.metadata?.productId || item.id,
            name: item.description || "Unknown",
            price: (item.price?.unit_amount || 0) / 100,
            quantity: item.quantity || 1,
          };
        });

      await createOrder({
        items: orderItems,
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
