import fs from "fs";
import path from "path";
import { Product } from "@/types";

const dataPath = path.join(process.cwd(), "data", "products.json");

export function getProducts(): Product[] {
  const data = fs.readFileSync(dataPath, "utf-8");
  return JSON.parse(data);
}

export function getProductById(id: string): Product | undefined {
  const products = getProducts();
  return products.find((p) => p.id === id);
}

export function getProductsByCategory(category: string): Product[] {
  const products = getProducts();
  return products.filter((p) => p.category === category);
}

export function getFeaturedProducts(): Product[] {
  const products = getProducts();
  return products.filter((p) => p.featured);
}

export function getCategories(): string[] {
  const products = getProducts();
  return [...new Set(products.map((p) => p.category))];
}

export function createProduct(product: Omit<Product, "id">): Product {
  const products = getProducts();
  const newId = String(
    Math.max(...products.map((p) => parseInt(p.id)), 0) + 1
  );
  const newProduct = { ...product, id: newId };
  products.push(newProduct);
  fs.writeFileSync(dataPath, JSON.stringify(products, null, 2));
  return newProduct;
}

export function updateProduct(
  id: string,
  updates: Partial<Product>
): Product | null {
  const products = getProducts();
  const index = products.findIndex((p) => p.id === id);
  if (index === -1) return null;
  products[index] = { ...products[index], ...updates, id };
  fs.writeFileSync(dataPath, JSON.stringify(products, null, 2));
  return products[index];
}

export function deleteProduct(id: string): boolean {
  const products = getProducts();
  const filtered = products.filter((p) => p.id !== id);
  if (filtered.length === products.length) return false;
  fs.writeFileSync(dataPath, JSON.stringify(filtered, null, 2));
  return true;
}
