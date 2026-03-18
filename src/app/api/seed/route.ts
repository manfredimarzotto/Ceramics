import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

const products = [
  {
    name: "Rustic Stoneware Bowl",
    description: "Hand-thrown stoneware bowl with a warm, earthy glaze. Perfect for soups, salads, or as a decorative piece. Each bowl is unique with subtle variations in color and texture.",
    price: 45.0,
    image: "/images/bowl-stoneware.svg",
    category: "Bowls",
    inStock: true,
    featured: true,
  },
  {
    name: "Minimalist Porcelain Vase",
    description: "Elegant porcelain vase with a clean, modern silhouette. The matte white finish complements any décor style. Ideal for fresh or dried flower arrangements.",
    price: 78.0,
    image: "/images/vase-porcelain.svg",
    category: "Vases",
    inStock: true,
    featured: true,
  },
  {
    name: "Artisan Dinner Plate Set",
    description: "Set of 4 hand-glazed dinner plates with an organic, slightly irregular edge. The speckled finish adds character to any table setting.",
    price: 120.0,
    image: "/images/plate-set.svg",
    category: "Plates",
    inStock: true,
    featured: true,
  },
  {
    name: "Ceramic Coffee Mug",
    description: "Generously sized coffee mug with a comfortable handle and a drippy glaze effect. Microwave and dishwasher safe. Holds approximately 12 oz.",
    price: 28.0,
    image: "/images/mug-coffee.svg",
    category: "Mugs",
    inStock: true,
    featured: false,
  },
  {
    name: "Terracotta Planter",
    description: "Classic terracotta planter with a drainage hole and matching saucer. The natural clay body develops a beautiful patina over time.",
    price: 35.0,
    image: "/images/planter-terracotta.svg",
    category: "Planters",
    inStock: true,
    featured: true,
  },
  {
    name: "Raku Tea Bowl",
    description: "Traditional raku-fired tea bowl with a stunning metallic glaze. Each piece features unique crackle patterns created during the firing process.",
    price: 65.0,
    image: "/images/bowl-raku.svg",
    category: "Bowls",
    inStock: true,
    featured: false,
  },
  {
    name: "Ceramic Serving Platter",
    description: "Large oval serving platter with a hand-painted botanical design. Perfect for entertaining or as a statement piece on your dining table.",
    price: 95.0,
    image: "/images/platter-serving.svg",
    category: "Plates",
    inStock: true,
    featured: false,
  },
  {
    name: "Glazed Bud Vase Trio",
    description: "Set of 3 small bud vases in complementary earth-tone glazes. Perfect for displaying single stems or small wildflower bunches.",
    price: 52.0,
    image: "/images/vase-bud-trio.svg",
    category: "Vases",
    inStock: true,
    featured: false,
  },
];

export async function POST() {
  try {
    const adminPassword = process.env.ADMIN_PASSWORD;
    if (!adminPassword) {
      return NextResponse.json({ error: "Not configured" }, { status: 500 });
    }

    await prisma.orderItem.deleteMany();
    await prisma.order.deleteMany();
    await prisma.product.deleteMany();

    for (const product of products) {
      await prisma.product.create({ data: product });
    }

    return NextResponse.json({ success: true, count: products.length });
  } catch (error) {
    console.error("Seed error:", error);
    return NextResponse.json(
      { error: "Failed to seed database" },
      { status: 500 }
    );
  }
}
