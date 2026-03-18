"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useCart } from "@/context/CartContext";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function SuccessContent() {
  const { clearCart } = useCart();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");

  useEffect(() => {
    if (sessionId) {
      clearCart();
    }
  }, [sessionId, clearCart]);

  return (
    <div className="max-w-2xl mx-auto px-4 py-16 text-center">
      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <h1 className="text-3xl font-bold text-gray-900 mb-4">Order Confirmed!</h1>
      <p className="text-gray-600 mb-2">
        Thank you for your purchase. Your handcrafted ceramics are on their way!
      </p>
      <p className="text-sm text-gray-500 mb-8">
        You will receive an email confirmation shortly with your order details.
      </p>
      {sessionId && (
        <p className="text-xs text-gray-400 mb-8">
          Session: {sessionId}
        </p>
      )}
      <Link
        href="/"
        className="px-6 py-3 bg-clay-600 text-white font-semibold rounded-md hover:bg-clay-700 transition-colors"
      >
        Continue Shopping
      </Link>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={<div className="max-w-2xl mx-auto px-4 py-16 text-center"><p>Loading...</p></div>}>
      <SuccessContent />
    </Suspense>
  );
}
