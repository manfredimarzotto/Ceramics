"use client";

import { useEffect, useState } from "react";
import { Order } from "@/types";

const statusOptions: Order["status"][] = ["pending", "confirmed", "shipped", "delivered"];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = () => {
    fetch("/api/orders")
      .then((res) => res.json())
      .then((data) => {
        setOrders(data.sort((a: Order, b: Order) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        ));
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const updateStatus = async (id: string, status: Order["status"]) => {
    await fetch(`/api/orders/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    fetchOrders();
  };

  if (loading) {
    return <p className="text-gray-500">Loading orders...</p>;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Orders</h1>

      {orders.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm p-8 text-center">
          <p className="text-gray-500">No orders yet. Orders will appear here after customers complete checkout.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                <div>
                  <p className="font-mono text-sm text-gray-500">{order.id}</p>
                  <p className="font-semibold text-gray-900 mt-1">
                    {order.customerName || "Anonymous"}
                  </p>
                  <p className="text-sm text-gray-500">{order.customerEmail}</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-clay-700">${order.total.toFixed(2)}</p>
                  <p className="text-sm text-gray-500 mt-1">
                    {new Date(order.createdAt).toLocaleDateString()} at{" "}
                    {new Date(order.createdAt).toLocaleTimeString()}
                  </p>
                </div>
              </div>

              <div className="border-t border-gray-100 pt-4 mb-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Items</h4>
                <div className="space-y-1">
                  {order.items.map((item, i) => (
                    <div key={i} className="flex justify-between text-sm">
                      <span className="text-gray-600">
                        {item.name} x{item.quantity}
                      </span>
                      <span className="font-medium">${(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {order.shippingAddress && (
                <div className="border-t border-gray-100 pt-4 mb-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-1">Shipping Address</h4>
                  <p className="text-sm text-gray-500">
                    {order.shippingAddress.line1}
                    {order.shippingAddress.line2 && `, ${order.shippingAddress.line2}`}
                    , {order.shippingAddress.city}, {order.shippingAddress.state}{" "}
                    {order.shippingAddress.postalCode}, {order.shippingAddress.country}
                  </p>
                </div>
              )}

              <div className="border-t border-gray-100 pt-4 flex items-center gap-3">
                <label className="text-sm font-medium text-gray-700">Status:</label>
                <select
                  value={order.status}
                  onChange={(e) => updateStatus(order.id, e.target.value as Order["status"])}
                  className="px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-clay-500"
                >
                  {statusOptions.map((s) => (
                    <option key={s} value={s}>
                      {s.charAt(0).toUpperCase() + s.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
