import { NextRequest, NextResponse } from "next/server";
import { getProducts, createProduct } from "@/lib/products";

export async function GET() {
  const products = getProducts();
  return NextResponse.json(products);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const product = createProduct(body);
  return NextResponse.json(product, { status: 201 });
}
