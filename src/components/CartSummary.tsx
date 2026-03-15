"use client";

import { useCart } from "@/context/CartContext";
import { useState } from "react";

export default function CartSummary() {
  const { totalPrice, items } = useCart();
  const [loading, setLoading] = useState(false);

  const handleCheckout = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((item) => ({
            productId: item.product.id,
            name: item.product.name,
            price: item.product.price,
            quantity: item.quantity,
            image: item.product.image,
          })),
        }),
      });

      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert("Could not create checkout session. Please check your Stripe configuration.");
      }
    } catch {
      alert("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const shipping = totalPrice > 100 ? 0 : 9.99;
  const total = totalPrice + shipping;

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h3 className="text-lg font-semibold mb-4">Order Summary</h3>
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-600">Subtotal</span>
          <span className="font-medium">${totalPrice.toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Shipping</span>
          <span className="font-medium">
            {shipping === 0 ? "Free" : `$${shipping.toFixed(2)}`}
          </span>
        </div>
        {totalPrice > 0 && totalPrice <= 100 && (
          <p className="text-xs text-clay-600">
            Free shipping on orders over $100
          </p>
        )}
        <div className="border-t border-gray-200 pt-2 mt-2">
          <div className="flex justify-between text-base font-bold">
            <span>Total</span>
            <span className="text-clay-700">${total.toFixed(2)}</span>
          </div>
        </div>
      </div>
      <button
        onClick={handleCheckout}
        disabled={loading || items.length === 0}
        className="w-full mt-6 py-3 bg-clay-600 text-white font-semibold rounded-md hover:bg-clay-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
      >
        {loading ? "Processing..." : "Proceed to Checkout"}
      </button>
    </div>
  );
}
