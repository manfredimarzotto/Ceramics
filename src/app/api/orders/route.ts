import { NextRequest, NextResponse } from "next/server";
import { getOrders, createOrder } from "@/lib/orders";

export async function GET() {
  const orders = getOrders();
  return NextResponse.json(orders);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const order = createOrder(body);
  return NextResponse.json(order, { status: 201 });
}
