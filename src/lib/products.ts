import { prisma } from "@/lib/db";
import type { Product } from "@/types";

export async function getProducts(): Promise<Product[]> {
  const products = await prisma.product.findMany({
    orderBy: { createdAt: "desc" },
  });
  return products.map(mapProduct);
}

export async function getProductById(id: string): Promise<Product | null> {
  const product = await prisma.product.findUnique({ where: { id } });
  return product ? mapProduct(product) : null;
}

export async function getProductsByCategory(category: string): Promise<Product[]> {
  const products = await prisma.product.findMany({
    where: { category },
    orderBy: { createdAt: "desc" },
  });
  return products.map(mapProduct);
}

export async function getFeaturedProducts(): Promise<Product[]> {
  const products = await prisma.product.findMany({
    where: { featured: true },
    orderBy: { createdAt: "desc" },
  });
  return products.map(mapProduct);
}

export async function getCategories(): Promise<string[]> {
  const products = await prisma.product.findMany({
    select: { category: true },
    distinct: ["category"],
  });
  return products.map((p) => p.category);
}

export async function createProduct(data: Omit<Product, "id">): Promise<Product> {
  const product = await prisma.product.create({ data });
  return mapProduct(product);
}

export async function updateProduct(
  id: string,
  updates: Partial<Product>
): Promise<Product | null> {
  try {
    const { id: _id, ...data } = updates;
    const product = await prisma.product.update({ where: { id }, data });
    return mapProduct(product);
  } catch {
    return null;
  }
}

export async function deleteProduct(id: string): Promise<boolean> {
  try {
    await prisma.product.delete({ where: { id } });
    return true;
  } catch {
    return false;
  }
}

export async function searchProducts(query: string): Promise<Product[]> {
  const products = await prisma.product.findMany({
    where: {
      OR: [
        { name: { contains: query, mode: "insensitive" } },
        { description: { contains: query, mode: "insensitive" } },
        { category: { contains: query, mode: "insensitive" } },
      ],
    },
    orderBy: { createdAt: "desc" },
  });
  return products.map(mapProduct);
}

function mapProduct(p: { id: string; name: string; description: string; price: number; image: string; category: string; inStock: boolean; featured: boolean }): Product {
  return {
    id: p.id,
    name: p.name,
    description: p.description,
    price: p.price,
    image: p.image,
    category: p.category,
    inStock: p.inStock,
    featured: p.featured,
  };
}
