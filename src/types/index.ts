export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  inStock: boolean;
  featured: boolean;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface ShippingAddress {
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface Order {
  id: string;
  items: { productId: string; name: string; price: number; quantity: number }[];
  total: number;
  customerEmail: string;
  customerName: string;
  shippingAddress: ShippingAddress;
  status: "pending" | "confirmed" | "shipped" | "delivered";
  stripeSessionId: string;
  createdAt: string;
}
