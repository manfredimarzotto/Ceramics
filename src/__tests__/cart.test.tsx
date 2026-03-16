import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { CartProvider, useCart } from "@/context/CartContext";
import { Product } from "@/types";

const mockProduct: Product = {
  id: "1",
  name: "Test Bowl",
  description: "A test product",
  price: 45.0,
  image: "/images/test.svg",
  category: "Bowls",
  inStock: true,
  featured: false,
};

const mockProduct2: Product = {
  id: "2",
  name: "Test Vase",
  description: "Another test product",
  price: 78.0,
  image: "/images/test2.svg",
  category: "Vases",
  inStock: true,
  featured: true,
};

beforeEach(() => {
  localStorage.clear();
  vi.clearAllMocks();
});

function renderCartHook() {
  return renderHook(() => useCart(), {
    wrapper: ({ children }) => <CartProvider>{children}</CartProvider>,
  });
}

describe("useCart", () => {
  it("starts with empty cart", () => {
    const { result } = renderCartHook();
    expect(result.current.items).toEqual([]);
    expect(result.current.totalItems).toBe(0);
    expect(result.current.totalPrice).toBe(0);
  });

  it("adds an item to cart", () => {
    const { result } = renderCartHook();
    act(() => {
      result.current.addItem(mockProduct);
    });
    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0].product.id).toBe("1");
    expect(result.current.items[0].quantity).toBe(1);
    expect(result.current.totalItems).toBe(1);
    expect(result.current.totalPrice).toBe(45.0);
  });

  it("increments quantity when adding same item twice", () => {
    const { result } = renderCartHook();
    act(() => {
      result.current.addItem(mockProduct);
      result.current.addItem(mockProduct);
    });
    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0].quantity).toBe(2);
    expect(result.current.totalItems).toBe(2);
    expect(result.current.totalPrice).toBe(90.0);
  });

  it("adds different items separately", () => {
    const { result } = renderCartHook();
    act(() => {
      result.current.addItem(mockProduct);
      result.current.addItem(mockProduct2);
    });
    expect(result.current.items).toHaveLength(2);
    expect(result.current.totalItems).toBe(2);
    expect(result.current.totalPrice).toBe(123.0);
  });

  it("removes an item", () => {
    const { result } = renderCartHook();
    act(() => {
      result.current.addItem(mockProduct);
      result.current.addItem(mockProduct2);
    });
    act(() => {
      result.current.removeItem("1");
    });
    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0].product.id).toBe("2");
  });

  it("updates quantity", () => {
    const { result } = renderCartHook();
    act(() => {
      result.current.addItem(mockProduct);
    });
    act(() => {
      result.current.updateQuantity("1", 5);
    });
    expect(result.current.items[0].quantity).toBe(5);
    expect(result.current.totalItems).toBe(5);
    expect(result.current.totalPrice).toBe(225.0);
  });

  it("removes item when quantity set to 0", () => {
    const { result } = renderCartHook();
    act(() => {
      result.current.addItem(mockProduct);
    });
    act(() => {
      result.current.updateQuantity("1", 0);
    });
    expect(result.current.items).toHaveLength(0);
  });

  it("clears the cart", () => {
    const { result } = renderCartHook();
    act(() => {
      result.current.addItem(mockProduct);
      result.current.addItem(mockProduct2);
    });
    act(() => {
      result.current.clearCart();
    });
    expect(result.current.items).toHaveLength(0);
    expect(result.current.totalItems).toBe(0);
    expect(result.current.totalPrice).toBe(0);
  });

  it("throws when used outside CartProvider", () => {
    expect(() => {
      renderHook(() => useCart());
    }).toThrow("useCart must be used within a CartProvider");
  });
});
