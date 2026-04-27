import React from "react";
import { useFetch } from "../lib/hooks";
import { Product } from "../types";
import { Zap, ArrowRight, CheckCircle2, AlertTriangle, Info } from "lucide-react";
import { Link } from "react-router-dom";
import { useNotify } from "../components/NotificationProvider";

export default function Recommendations() {
  const { data: products, loading } = useFetch<Product[]>("/api/products");
  const { notify } = useNotify();

  if (loading || !products) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>;

  const handleExecute = async (product: Product) => {
    const requiredQuantity = Math.max(1, product.predictedDemand - product.stock);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: product.id,
          productName: product.name,
          quantity: requiredQuantity,
          totalCost: requiredQuantity * 450 // approx INR rate
        })
      });
      if (res.ok) {
        notify(`AI-optimized order for ${requiredQuantity} units of ${product.name} transmitted.`, "success");
      }
    } catch (err) {
      notify("Failed to process order. Please try again.", "error");
    }
  };

  const getRecommendation = (product: Product) => {
    if (product.status === "Low") {
      const units = Math.max(100, product.predictedDemand - product.stock + 50);
      return {
        action: `Restock ${units} units`,
        reason: "Critical stock level vs high predicted demand",
        type: "danger",
        icon: AlertTriangle
      };
    }
    if (product.predictedDemand > product.stock * 1.5) {
      return {
        action: "High Demand Alert",
        reason: "Upcoming spike detected. Monitor closely.",
        type: "warning",
        icon: Zap
      };
    }
    return {
      action: "Maintain Stock",
      reason: "Current levels sufficient for forecasted demand",
      type: "success",
      icon: CheckCircle2
    };
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">AI Recommendations</h2>
        <p className="text-slate-500">Automated inventory action plans based on neural predictions</p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {products.map((product) => {
          const rec = getRecommendation(product);
          return (
            <div 
              key={product.id}
              className={`bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col md:flex-row items-center justify-between gap-6 hover:border-blue-200 transition-all`}
            >
              <div className="flex items-center gap-6 flex-1">
                <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${
                  rec.type === 'danger' ? 'bg-red-50 text-red-600' : 
                  rec.type === 'warning' ? 'bg-amber-50 text-amber-600' : 'bg-green-50 text-green-600'
                }`}>
                  <rec.icon size={28} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900">{product.name}</h3>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-sm text-slate-500">Stock: <span className="font-bold text-slate-700">{product.stock}</span></span>
                    <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                    <span className="text-sm text-slate-500">Demand: <span className="font-bold text-slate-700">{product.predictedDemand}</span></span>
                  </div>
                </div>
              </div>

              <div className="flex-1 md:px-12">
                 <p className="text-sm font-semibold text-slate-900">{rec.action}</p>
                 <p className="text-sm text-slate-500 mt-0.5">{rec.reason}</p>
              </div>

              <div className="flex items-center gap-3">
                <Link 
                  to={`/products/${product.id}`}
                  className="px-4 py-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg font-bold text-sm transition-all"
                >
                  View Details
                </Link>
                <button 
                   onClick={() => handleExecute(product)}
                   className={`px-6 py-2 rounded-lg font-bold text-sm text-white transition-all shadow-md ${
                    rec.type === 'danger' ? 'bg-red-600 hover:bg-red-700' : 
                    rec.type === 'warning' ? 'bg-amber-600 hover:bg-amber-700' : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                >
                  Execute Order
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
