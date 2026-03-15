import fs from "fs";
import path from "path";
import { Order } from "@/types";

const dataPath = path.join(process.cwd(), "data", "orders.json");

export function getOrders(): Order[] {
  const data = fs.readFileSync(dataPath, "utf-8");
  return JSON.parse(data);
}

export function getOrderById(id: string): Order | undefined {
  const orders = getOrders();
  return orders.find((o) => o.id === id);
}

export function createOrder(order: Omit<Order, "id" | "createdAt">): Order {
  const orders = getOrders();
  const newOrder: Order = {
    ...order,
    id: `ORD-${Date.now()}`,
    createdAt: new Date().toISOString(),
  };
  orders.push(newOrder);
  fs.writeFileSync(dataPath, JSON.stringify(orders, null, 2));
  return newOrder;
}

export function updateOrderStatus(
  id: string,
  status: Order["status"]
): Order | null {
  const orders = getOrders();
  const index = orders.findIndex((o) => o.id === id);
  if (index === -1) return null;
  orders[index].status = status;
  fs.writeFileSync(dataPath, JSON.stringify(orders, null, 2));
  return orders[index];
}
