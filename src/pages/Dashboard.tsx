import React, { useEffect, useState } from "react";
import { 
  Package, 
  TrendingUp, 
  AlertTriangle, 
  ArrowUpRight, 
  ArrowDownRight,
  TrendingDown,
  Info,
  Zap
} from "lucide-react";
import { useFetch } from "../lib/hooks";
import { Product } from "../types";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from "recharts";
import { geminiService } from "../services/geminiService";
import { useNotify } from "../components/NotificationProvider";

export default function Dashboard() {
// Replace line 29 with this:
const { data: products, loading } = useFetch<Product[]>("https://suppl-ai-gamma.vercel.app/api");;
  const [aiRecommendation, setAiRecommendation] = useState<string>("Analyzing recent inventory trends...");
  const [isGenerating, setIsGenerating] = useState(false);
  const { notify } = useNotify();

  useEffect(() => {
    if (products && products.length > 0) {
      setIsGenerating(true);
      geminiService.getInventoryRecommendation(products).then(res => {
        setAiRecommendation(res);
        setIsGenerating(false);
      });
    }
  }, [products]);

  const handleApprove = async () => {
    const lowStockProduct = products.find(p => p.status === "Low");
    if (!lowStockProduct) {
       notify("All products are well stocked. No urgent order needed.", "info");
       return;
    }

    const requiredQuantity = Math.max(1, lowStockProduct.predictedDemand - lowStockProduct.stock);

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: lowStockProduct.id,
          productName: lowStockProduct.name,
          quantity: requiredQuantity,
          totalCost: requiredQuantity * 450 // approx INR rate
        })
      });
      if (res.ok) {
        notify(`Purchase order for ${requiredQuantity} units of ${lowStockProduct.name} approved.`, "success");
      }
    } catch (err) {
      notify("Failed to process order. Please try again.", "error");
    }
  };

  if (loading || !products) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>;

  const totalProducts = products.length;
  const lowStockProducts = products.filter(p => p.status === "Low").length;
  const totalPredictedDemand = products.reduce((acc, p) => acc + p.predictedDemand, 0);

  const chartData = products.map(p => ({
    name: p.name,
    stock: p.stock,
    demand: p.predictedDemand
  }));

  const alerts = [
    { type: "warning", message: "Shampoo A is running low (40 units left)", icon: AlertTriangle },
    { type: "info", message: "High demand expected for Shampoo C next week", icon: TrendingUp },
    { type: "warning", message: "Shampoo C stock critical (15 units)", icon: AlertTriangle },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">SupplAI Dashboard</h2>
        <p className="text-slate-500">Real-time inventory and demand intelligence</p>
      </div>

      {/* Alert Bar */}
      <div className="bg-[#EFF6FF] border border-[#BFDBFE] rounded-lg px-5 py-3 flex items-center gap-3 text-[#1E40AF] text-sm shadow-sm">
        <Zap size={16} className="fill-current" />
        <p><strong>Demand Spike Alert:</strong> High demand expected for 'Shampoo A' in North-East region starting in 48 hours.</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white p-5 rounded-xl border border-[#E2E8F0] shadow-[0_1px_3px_rgba(0,0,0,0.05)]">
          <p className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider mb-2">Total SKU Active</p>
          <div className="flex items-end justify-between">
            <p className="text-2xl font-bold text-[#1E293B]">{totalProducts.toLocaleString()}</p>
            <span className="text-[11px] font-bold text-green-600">+12% from last month</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-[#E2E8F0] shadow-[0_1px_3px_rgba(0,0,0,0.05)]">
          <p className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider mb-2">Low Stock Items</p>
          <div className="flex items-end justify-between">
            <p className="text-2xl font-bold text-red-600">{lowStockProducts}</p>
            <span className="text-[11px] font-bold text-red-500">Requires restock</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-[#E2E8F0] shadow-[0_1px_3px_rgba(0,0,0,0.05)]">
          <p className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider mb-2">Predicted Demand Vol.</p>
          <div className="flex items-end justify-between">
            <p className="text-2xl font-bold text-[#1E293B]">{totalPredictedDemand.toLocaleString()}</p>
            <span className="text-[11px] font-bold text-[#64748B]">Across all cats</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Chart */}
        <div className="lg:col-span-2 bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-lg font-bold text-slate-900">Stock vs Predicted Demand</h3>
            <div className="flex gap-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span className="text-xs text-slate-500">Current Stock</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-slate-200 rounded-full"></div>
                <span className="text-xs text-slate-500">Predicted Demand</span>
              </div>
            </div>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748B', fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748B', fontSize: 12}} />
                <Tooltip 
                  cursor={{fill: '#F8FAFC'}} 
                  contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}}
                />
                <Bar dataKey="stock" fill="#2563EB" radius={[4, 4, 0, 0]} />
                <Bar dataKey="demand" fill="#E2E8F0" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Alerts / Insights */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Stock Alerts</h3>
            <div className="space-y-4">
              {alerts.map((alert, i) => (
                <div key={i} className={`flex gap-3 p-4 rounded-xl border ${
                  alert.type === 'warning' ? 'bg-red-50/50 border-red-100 text-red-700' : 'bg-blue-50/50 border-blue-100 text-blue-700'
                }`}>
                  <alert.icon size={20} className="shrink-0 mt-0.5" />
                  <p className="text-sm font-medium">{alert.message}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-blue-600 p-6 rounded-2xl text-white shadow-lg shadow-blue-200">
            <div className="flex items-center gap-2 mb-2">
              <Zap size={18} className={`fill-current text-blue-200 ${isGenerating ? 'animate-pulse' : ''}`} />
              <h4 className="font-bold">AI Recommendation</h4>
            </div>
            <p className="text-sm text-blue-100 leading-relaxed min-h-[60px]">
              {aiRecommendation}
            </p>
            <button 
              onClick={handleApprove}
              className="mt-4 w-full bg-white text-blue-600 font-bold py-2 rounded-lg text-sm hover:bg-blue-50 transition-colors"
            >
              Approve Order
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
