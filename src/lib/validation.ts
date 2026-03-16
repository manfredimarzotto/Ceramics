import { z } from "zod";

export const createProductSchema = z.object({
  name: z.string().min(1, "Name is required").max(200),
  description: z.string().min(1, "Description is required").max(2000),
  price: z.number().positive("Price must be positive").max(99999),
  image: z.string().min(1).max(500),
  category: z.string().min(1, "Category is required").max(100),
  inStock: z.boolean(),
  featured: z.boolean(),
});

export const updateProductSchema = createProductSchema.partial();

export const createOrderSchema = z.object({
  items: z
    .array(
      z.object({
        productId: z.string().min(1),
        name: z.string().min(1),
        price: z.number().nonnegative(),
        quantity: z.number().int().positive(),
      })
    )
    .min(1, "At least one item is required"),
  total: z.number().nonnegative(),
  customerEmail: z.string().email("Valid email required"),
  customerName: z.string().min(1, "Customer name is required").max(200),
  shippingAddress: z.object({
    line1: z.string().min(1),
    line2: z.string().optional(),
    city: z.string().min(1),
    state: z.string().min(1),
    postalCode: z.string().min(1),
    country: z.string().min(1),
  }),
  status: z.enum(["pending", "confirmed", "shipped", "delivered"]),
  stripeSessionId: z.string().min(1),
});

export const updateOrderStatusSchema = z.object({
  status: z.enum(["pending", "confirmed", "shipped", "delivered"]),
});

export const checkoutSchema = z.object({
  items: z
    .array(
      z.object({
        productId: z.string().optional(),
        name: z.string().min(1),
        price: z.number().positive(),
        quantity: z.number().int().positive(),
        image: z.string().optional(),
      })
    )
    .min(1, "Cart cannot be empty"),
});

export const loginSchema = z.object({
  password: z.string().min(1, "Password is required"),
});
