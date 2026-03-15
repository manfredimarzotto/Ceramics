"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Product } from "@/types";
import { useCart } from "@/context/CartContext";
import { useParams } from "next/navigation";

export default function ProductDetailPage() {
  const params = useParams();
  const { addItem } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    fetch(`/api/products/${params.id}`)
      .then((res) => res.json())
      .then((data) => {
        setProduct(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [params.id]);

  const handleAddToCart = () => {
    if (product) {
      addItem(product);
      setAdded(true);
      setTimeout(() => setAdded(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Product Not Found</h1>
        <Link href="/products" className="text-clay-600 hover:text-clay-700">
          Back to Shop
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Link href="/products" className="text-clay-600 hover:text-clay-700 text-sm mb-6 inline-block">
        &larr; Back to Shop
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        <div className="aspect-square bg-clay-100 rounded-lg overflow-hidden">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover"
          />
        </div>

        <div className="flex flex-col justify-center">
          <span className="text-sm text-clay-500 font-medium uppercase tracking-wider">
            {product.category}
          </span>
          <h1 className="text-3xl font-bold text-gray-900 mt-2">{product.name}</h1>
          <p className="text-3xl font-bold text-clay-700 mt-4">
            ${product.price.toFixed(2)}
          </p>
          <p className="text-gray-600 mt-6 leading-relaxed">{product.description}</p>

          <div className="mt-8 flex items-center gap-4">
            <button
              onClick={handleAddToCart}
              disabled={!product.inStock}
              className="px-8 py-3 bg-clay-600 text-white font-semibold rounded-md hover:bg-clay-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              {added ? "Added!" : product.inStock ? "Add to Cart" : "Out of Stock"}
            </button>
            {product.inStock && (
              <span className="text-sm text-green-600 font-medium">In Stock</span>
            )}
          </div>

          <div className="mt-8 border-t border-gray-200 pt-6">
            <h3 className="text-sm font-semibold text-gray-900 mb-2">Details</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>Handcrafted by skilled artisans</li>
              <li>Food-safe glaze (where applicable)</li>
              <li>Each piece is unique</li>
              <li>Free shipping on orders over $100</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
