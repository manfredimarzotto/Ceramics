import { prisma } from "@/lib/db";
import { Order } from "@/types";

export async function getOrders(): Promise<Order[]> {
  const orders = await prisma.order.findMany({
    include: { items: true },
    orderBy: { createdAt: "desc" },
  });
  return orders.map(mapOrder);
}

export async function getOrderById(id: string): Promise<Order | null> {
  const order = await prisma.order.findUnique({
    where: { id },
    include: { items: true },
  });
  return order ? mapOrder(order) : null;
}

export async function createOrder(
  data: Omit<Order, "id" | "createdAt">
): Promise<Order> {
  const order = await prisma.order.create({
    data: {
      id: `ORD-${Date.now()}`,
      total: data.total,
      customerEmail: data.customerEmail,
      customerName: data.customerName,
      shippingLine1: data.shippingAddress.line1,
      shippingLine2: data.shippingAddress.line2,
      shippingCity: data.shippingAddress.city,
      shippingState: data.shippingAddress.state,
      shippingPostal: data.shippingAddress.postalCode,
      shippingCountry: data.shippingAddress.country,
      status: data.status,
      stripeSessionId: data.stripeSessionId,
      items: {
        create: data.items.map((item) => ({
          productId: item.productId,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
        })),
      },
    },
    include: { items: true },
  });
  return mapOrder(order);
}

export async function updateOrderStatus(
  id: string,
  status: Order["status"]
): Promise<Order | null> {
  try {
    const order = await prisma.order.update({
      where: { id },
      data: { status },
      include: { items: true },
    });
    return mapOrder(order);
  } catch {
    return null;
  }
}

interface DbOrder {
  id: string;
  total: number;
  customerEmail: string;
  customerName: string;
  shippingLine1: string;
  shippingLine2: string | null;
  shippingCity: string;
  shippingState: string;
  shippingPostal: string;
  shippingCountry: string;
  status: string;
  stripeSessionId: string;
  createdAt: Date;
  items: { productId: string; name: string; price: number; quantity: number }[];
}

function mapOrder(o: DbOrder): Order {
  return {
    id: o.id,
    items: o.items.map((i) => ({
      productId: i.productId,
      name: i.name,
      price: i.price,
      quantity: i.quantity,
    })),
    total: o.total,
    customerEmail: o.customerEmail,
    customerName: o.customerName,
    shippingAddress: {
      line1: o.shippingLine1,
      line2: o.shippingLine2 || undefined,
      city: o.shippingCity,
      state: o.shippingState,
      postalCode: o.shippingPostal,
      country: o.shippingCountry,
    },
    status: o.status as Order["status"],
    stripeSessionId: o.stripeSessionId,
    createdAt: o.createdAt.toISOString(),
  };
}
