import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { 
  ArrowLeft, 
  Package, 
  TrendingUp, 
  AlertTriangle,
  Lightbulb,
  Zap,
  RefreshCcw,
  Calendar
} from "lucide-react";
import { useFetch } from "../../lib/hooks";
import { Product } from "../../types";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from "recharts";
import { geminiService } from "../../services/geminiService";
import { useNotify } from "../../components/NotificationProvider";

export default function ProductDetail() {
  const { id } = useParams();
  const { data: product, loading } = useFetch<Product>(`/api/products/${id}`);
  const [aiAnalysis, setAiAnalysis] = useState<string>("Running deep neural analysis on product trends...");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const { notify } = useNotify();

  useEffect(() => {
    if (product) {
      setIsAnalyzing(true);
      geminiService.getProductAnalysis(product).then(res => {
        setAiAnalysis(res);
        setIsAnalyzing(false);
      });
    }
  }, [product]);

  const handleOrder = async () => {
    if (!product) return;
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
        notify(`Purchase order for ${requiredQuantity} units of ${product.name} initiated.`, "success");
      }
    } catch (err) {
      notify("Failed to initiate order.", "error");
    }
  };

  if (loading || !product) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>;

  const chartData = [
    ...product.salesHistory.map((val, i) => ({
      name: `Past ${product.salesHistory.length - i}`,
      actual: val,
      predicted: null
    })),
    {
      name: "Current",
      actual: product.stock,
      predicted: product.stock
    },
    {
      name: "Future 1",
      actual: null,
      predicted: product.predictedDemand * 0.8
    },
    {
      name: "Future 2",
      actual: null,
      predicted: product.predictedDemand
    },
    {
      name: "Future 3",
      actual: null,
      predicted: product.predictedDemand * 1.2
    }
  ];

  return (
    <div className="space-y-8">
      <Link to="/products" className="flex items-center gap-2 text-slate-500 hover:text-blue-600 font-medium transition-colors">
        <ArrowLeft size={18} />
        Back to Products
      </Link>

      <div className="flex flex-col lg:flex-row gap-6">
        <div className="flex-1 space-y-6">
          <div className="bg-white p-6 rounded-xl border border-[#E2E8F0] shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4">
               <span className={`px-3 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                product.status === 'Low' 
                  ? 'bg-[#FEE2E2] text-[#991B1B]' 
                  : 'bg-[#DCFCE7] text-[#166534]'
              }`}>
                {product.status} Stock
              </span>
            </div>
            
            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-2xl shadow-lg shadow-blue-200">
                {product.name[0]}
              </div>
              <div>
                <h2 className="text-2xl font-bold text-[#1E293B]">{product.name}</h2>
                <p className="text-xs font-semibold text-[#64748B] uppercase tracking-wide">{product.category} • SKU: SUP-{product.id.toUpperCase()}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 pt-6 border-t border-slate-100">
              <div>
                <p className="text-[#64748B] text-[11px] font-bold uppercase tracking-wider mb-1">Stock</p>
                <p className="text-lg font-bold text-[#1E293B]">{product.stock} units</p>
              </div>
              <div>
                <p className="text-[#64748B] text-[11px] font-bold uppercase tracking-wider mb-1">Prediction</p>
                <p className="text-lg font-bold text-[#1E293B]">{product.predictedDemand} units</p>
              </div>
              <div>
                <p className="text-[#64748B] text-[11px] font-bold uppercase tracking-wider mb-1">Lead Time</p>
                <p className="text-lg font-bold text-[#1E293B]">3 days</p>
              </div>
              <div>
                <p className="text-[#64748B] text-[11px] font-bold uppercase tracking-wider mb-1">Reorder Pt</p>
                <p className="text-lg font-bold text-blue-600">80 units</p>
              </div>
            </div>
          </div>

          {/* Chart Section */}
          <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-bold text-slate-900">Sales Trend & Forecast</h3>
              <div className="flex gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span className="text-xs text-slate-500">Actual Sales</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-200 rounded-full"></div>
                  <span className="text-xs text-slate-500">Predicted Demand</span>
                </div>
              </div>
            </div>
            
            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563EB" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#2563EB" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorPredicted" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#93C5FD" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#93C5FD" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748B', fontSize: 12}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748B', fontSize: 12}} />
                  <Tooltip 
                    contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="actual" 
                    stroke="#2563EB" 
                    strokeWidth={3}
                    fillOpacity={1} 
                    fill="url(#colorActual)" 
                    connectNulls
                  />
                  <Area 
                    type="monotone" 
                    dataKey="predicted" 
                    stroke="#93C5FD" 
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    fillOpacity={1} 
                    fill="url(#colorPredicted)" 
                    connectNulls
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Sidebar Insights */}
        <div className="lg:w-80 space-y-6">
          <div className="bg-white p-6 rounded-xl border border-[#E2E8F0] shadow-sm">
            <h3 className="font-bold text-[#1E293B] text-sm uppercase tracking-wider mb-4 flex items-center justify-between">
              Demand Analysis
              {isAnalyzing && <RefreshCcw size={14} className="animate-spin text-blue-500" />}
            </h3>
            <ul className="space-y-4">
              <li className="flex gap-3">
                <div className="mt-1"><TrendingUp size={14} className="text-green-600" /></div>
                <p className="text-xs text-[#64748B] leading-relaxed">Demand is increasing by <strong>15% WoW</strong> compared to historical trends.</p>
              </li>
              <li className="flex gap-3">
                <div className="mt-1"><Calendar size={14} className="text-blue-600" /></div>
                <p className="text-xs text-[#64748B] leading-relaxed">Expected seasonal spike in the next <strong>10-14 days</strong>.</p>
              </li>
            </ul>

            <div className="bg-[#F0F9FF] border-l-4 border-[#0EA5E9] p-4 mt-6">
              <p className="text-[13px] text-[#1E293B] leading-relaxed italic">
                {aiAnalysis}
              </p>
            </div>

            <button 
              onClick={handleOrder}
              className="mt-6 w-full bg-[#2563EB] hover:bg-blue-700 text-white font-bold py-3 rounded-lg text-sm transition-all shadow-md shadow-blue-200"
            >
              Approve Purchase Order
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
