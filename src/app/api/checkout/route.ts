import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { checkoutSchema } from "@/lib/validation";
import { prisma } from "@/lib/db";
import Stripe from "stripe";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = checkoutSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Validation failed", details: result.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { items } = result.data;

    // Validate stock and prices server-side
    const productIds = items.map((item) => item.productId).filter(Boolean) as string[];
    if (productIds.length === 0) {
      return NextResponse.json({ error: "No valid products in cart" }, { status: 400 });
    }

    const dbProducts = await prisma.product.findMany({
      where: { id: { in: productIds } },
      select: { id: true, name: true, price: true, inStock: true },
    });

    const dbProductMap = new Map(dbProducts.map((p) => [p.id, p]));

    const outOfStock = dbProducts.filter((p) => !p.inStock);
    if (outOfStock.length > 0) {
      return NextResponse.json(
        { error: `Out of stock: ${outOfStock.map((p) => p.name).join(", ")}` },
        { status: 400 }
      );
    }

    // Verify all products exist in database
    for (const item of items) {
      if (item.productId && !dbProductMap.has(item.productId)) {
        return NextResponse.json(
          { error: `Product not found: ${item.name}` },
          { status: 400 }
        );
      }
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

    // Use database prices, not client-sent prices
    const subtotal = items.reduce((sum, item) => {
      const dbProduct = item.productId ? dbProductMap.get(item.productId) : null;
      const price = dbProduct ? dbProduct.price : item.price;
      return sum + price * item.quantity;
    }, 0);
    const shippingCost = subtotal > 100 ? 0 : 9.99;

    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = items.map((item) => {
      const dbProduct = item.productId ? dbProductMap.get(item.productId) : null;
      const price = dbProduct ? dbProduct.price : item.price;
      return {
        price_data: {
          currency: "usd",
          product_data: {
            name: dbProduct?.name || item.name,
            metadata: {
              productId: item.productId || "",
            },
          },
          unit_amount: Math.round(price * 100),
        },
        quantity: item.quantity,
      };
    });

    if (shippingCost > 0) {
      lineItems.push({
        price_data: {
          currency: "usd",
          product_data: { name: "Shipping" },
          unit_amount: Math.round(shippingCost * 100),
        },
        quantity: 1,
      });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: lineItems,
      shipping_address_collection: {
        allowed_countries: ["US", "CA", "GB", "AU"],
      },
      success_url: `${baseUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/cart`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Checkout error:", error);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
