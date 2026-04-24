import React from "react";
import { useFetch } from "../lib/hooks";
import { Order } from "../types";
import { Package, Clock, CheckCircle2, ChevronRight, ShoppingCart } from "lucide-react";
import { Link } from "react-router-dom";

export default function Orders() {
  const { data: orders, loading } = useFetch<Order[]>("/api/orders");

  if (loading || !orders) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Pending": return "text-amber-600 bg-amber-50 border-amber-100";
      case "Shipped": return "text-blue-600 bg-blue-50 border-blue-100";
      case "Delivered": return "text-green-600 bg-green-50 border-green-100";
      default: return "text-slate-600 bg-slate-50 border-slate-100";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Pending": return <Clock size={14} />;
      case "Shipped": return <Package size={14} />;
      case "Delivered": return <CheckCircle2 size={14} />;
      default: return null;
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Order History</h2>
        <p className="text-slate-500">Track all AI-suggested and manual inventory orders</p>
      </div>

      {orders.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <ShoppingCart className="text-slate-300" size={32} />
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-2">No orders yet</h3>
          <p className="text-slate-500 max-w-sm mx-auto mb-6">
            When you approve AI recommendations or place manual restock orders, they will appear here.
          </p>
          <Link 
            to="/recommendations"
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-lg font-bold text-sm hover:bg-blue-700 transition-colors"
          >
            Go to Recommendations
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Order ID</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Product</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Quantity</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <span className="text-sm font-mono text-slate-500">{order.id}</span>
                  </td>
                  <td className="px-6 py-4">
                    <Link to={`/products/${order.productId}`} className="text-sm font-bold text-slate-900 hover:text-blue-600 transition-colors">
                      {order.productName}
                    </Link>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-slate-600">{order.quantity} units</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${getStatusColor(order.status)}`}>
                      {getStatusIcon(order.status)}
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-slate-500">
                      {new Date(order.date).toLocaleDateString()}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="text-sm font-bold text-slate-900">
                      ₹{order.totalCost.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
