import { describe, it, expect } from "vitest";
import {
  createProductSchema,
  updateProductSchema,
  createOrderSchema,
  updateOrderStatusSchema,
  checkoutSchema,
  loginSchema,
} from "@/lib/validation";

describe("createProductSchema", () => {
  const validProduct = {
    name: "Test Bowl",
    description: "A beautiful test bowl",
    price: 45.0,
    image: "/images/test.svg",
    category: "Bowls",
    inStock: true,
    featured: false,
  };

  it("accepts valid product data", () => {
    const result = createProductSchema.safeParse(validProduct);
    expect(result.success).toBe(true);
  });

  it("rejects missing name", () => {
    const result = createProductSchema.safeParse({ ...validProduct, name: "" });
    expect(result.success).toBe(false);
  });

  it("rejects negative price", () => {
    const result = createProductSchema.safeParse({ ...validProduct, price: -10 });
    expect(result.success).toBe(false);
  });

  it("rejects price exceeding max", () => {
    const result = createProductSchema.safeParse({ ...validProduct, price: 100000 });
    expect(result.success).toBe(false);
  });

  it("rejects missing category", () => {
    const result = createProductSchema.safeParse({ ...validProduct, category: "" });
    expect(result.success).toBe(false);
  });

  it("rejects non-boolean inStock", () => {
    const result = createProductSchema.safeParse({ ...validProduct, inStock: "yes" });
    expect(result.success).toBe(false);
  });
});

describe("updateProductSchema", () => {
  it("accepts partial updates", () => {
    const result = updateProductSchema.safeParse({ name: "Updated Name" });
    expect(result.success).toBe(true);
  });

  it("accepts empty object", () => {
    const result = updateProductSchema.safeParse({});
    expect(result.success).toBe(true);
  });

  it("rejects invalid price in partial update", () => {
    const result = updateProductSchema.safeParse({ price: -5 });
    expect(result.success).toBe(false);
  });
});

describe("createOrderSchema", () => {
  const validOrder = {
    items: [
      { productId: "1", name: "Test Bowl", price: 45.0, quantity: 2 },
    ],
    total: 90.0,
    customerEmail: "test@example.com",
    customerName: "John Doe",
    shippingAddress: {
      line1: "123 Main St",
      city: "Portland",
      state: "OR",
      postalCode: "97201",
      country: "US",
    },
    status: "pending" as const,
    stripeSessionId: "cs_test_123",
  };

  it("accepts valid order data", () => {
    const result = createOrderSchema.safeParse(validOrder);
    expect(result.success).toBe(true);
  });

  it("rejects empty items array", () => {
    const result = createOrderSchema.safeParse({ ...validOrder, items: [] });
    expect(result.success).toBe(false);
  });

  it("rejects invalid email", () => {
    const result = createOrderSchema.safeParse({
      ...validOrder,
      customerEmail: "not-an-email",
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid status", () => {
    const result = createOrderSchema.safeParse({
      ...validOrder,
      status: "cancelled",
    });
    expect(result.success).toBe(false);
  });

  it("accepts optional line2 in shipping address", () => {
    const result = createOrderSchema.safeParse({
      ...validOrder,
      shippingAddress: { ...validOrder.shippingAddress, line2: "Apt 4" },
    });
    expect(result.success).toBe(true);
  });
});

describe("updateOrderStatusSchema", () => {
  it("accepts valid status", () => {
    expect(updateOrderStatusSchema.safeParse({ status: "pending" }).success).toBe(true);
    expect(updateOrderStatusSchema.safeParse({ status: "confirmed" }).success).toBe(true);
    expect(updateOrderStatusSchema.safeParse({ status: "shipped" }).success).toBe(true);
    expect(updateOrderStatusSchema.safeParse({ status: "delivered" }).success).toBe(true);
  });

  it("rejects invalid status", () => {
    expect(updateOrderStatusSchema.safeParse({ status: "cancelled" }).success).toBe(false);
    expect(updateOrderStatusSchema.safeParse({ status: "" }).success).toBe(false);
  });
});

describe("checkoutSchema", () => {
  it("accepts valid checkout data", () => {
    const result = checkoutSchema.safeParse({
      items: [{ name: "Bowl", price: 45.0, quantity: 1 }],
    });
    expect(result.success).toBe(true);
  });

  it("rejects empty cart", () => {
    const result = checkoutSchema.safeParse({ items: [] });
    expect(result.success).toBe(false);
  });

  it("rejects zero quantity", () => {
    const result = checkoutSchema.safeParse({
      items: [{ name: "Bowl", price: 45.0, quantity: 0 }],
    });
    expect(result.success).toBe(false);
  });

  it("rejects negative price", () => {
    const result = checkoutSchema.safeParse({
      items: [{ name: "Bowl", price: -10, quantity: 1 }],
    });
    expect(result.success).toBe(false);
  });
});

describe("loginSchema", () => {
  it("accepts valid password", () => {
    const result = loginSchema.safeParse({ password: "my-secret" });
    expect(result.success).toBe(true);
  });

  it("rejects empty password", () => {
    const result = loginSchema.safeParse({ password: "" });
    expect(result.success).toBe(false);
  });

  it("rejects missing password", () => {
    const result = loginSchema.safeParse({});
    expect(result.success).toBe(false);
  });
});
