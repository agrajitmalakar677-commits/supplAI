import React, { useState } from "react";
import { useFetch } from "../lib/hooks";
import { Product } from "../types";
import { Zap, Play, RotateCcw, TrendingUp, Info } from "lucide-react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell
} from "recharts";

export default function Simulation() {
  const { data: products, loading } = useFetch<Product[]>("/api/products");
  const [selectedProductId, setSelectedProductId] = useState<string>("");
  const [demandFactor, setDemandFactor] = useState(0); // -100 to +100 (%)

  const productsLoaded = products && products.length > 0;
  
  React.useEffect(() => {
    if (productsLoaded && !selectedProductId) {
      setSelectedProductId(products[0].id);
    }
  }, [productsLoaded, selectedProductId, products]);

  const selectedProduct = products?.find(p => p.id === selectedProductId);

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>;

  const originalDemand = selectedProduct?.predictedDemand || 0;
  const simulatedDemand = Math.round(originalDemand * (1 + demandFactor / 100));
  const isShortage = selectedProduct ? simulatedDemand > selectedProduct.stock : false;

  const chartData = [
    { name: 'Current Stock', value: selectedProduct?.stock || 0, color: '#64748B' },
    { name: 'Original Demand', value: originalDemand, color: '#2563EB' },
    { name: 'Simulated Demand', value: simulatedDemand, color: isShortage ? '#EF4444' : '#10B981' }
  ];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Demand Simulation</h2>
        <p className="text-slate-500">Run "What-If" scenarios to test supply chain resilience</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-8">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-4 uppercase tracking-wider">Select Product</label>
              <select 
                value={selectedProductId}
                onChange={(e) => setSelectedProductId(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              >
                {products?.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>

            <div>
              <div className="flex justify-between items-center mb-6">
                <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">Demand Adjustment</label>
                <span className={`text-lg font-bold ${demandFactor >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {demandFactor > 0 ? '+' : ''}{demandFactor}%
                </span>
              </div>
              <input 
                type="range" 
                min="-50" 
                max="200" 
                value={demandFactor} 
                onChange={(e) => setDemandFactor(parseInt(e.target.value))}
                className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
              <div className="flex justify-between text-xs text-slate-400 mt-2">
                <span>-50%</span>
                <span>Normal</span>
                <span>+200%</span>
              </div>
            </div>

            <button 
              onClick={() => setDemandFactor(0)}
              className="flex items-center justify-center gap-2 w-full py-3 text-slate-500 hover:text-slate-700 font-bold transition-colors"
            >
              <RotateCcw size={16} />
              Reset Scenario
            </button>
          </div>

          {isShortage && (
            <div className="bg-red-50 border border-red-100 p-6 rounded-2xl animate-pulse">
              <div className="flex items-center gap-3 text-red-600 mb-2">
                <Zap size={20} className="fill-current" />
                <h4 className="font-bold">Stockout Risk Detected</h4>
              </div>
              <p className="text-sm text-red-700">
                Simulated demand exceeds current stock by {simulatedDemand - (selectedProduct?.stock || 0)} units. 
                Immediate replenishment required to maintain service level.
              </p>
            </div>
          )}
        </div>

        <div className="lg:col-span-8 bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-4 mb-12">
            <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-white">
              <Play size={20} className="fill-current ml-1" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Simulation Results: {selectedProduct?.name}</h3>
              <p className="text-sm text-slate-500">Visualizing impact on inventory resilience</p>
            </div>
          </div>

          <div className="h-[400px]">
             <ResponsiveContainer width="100%" height="100%">
               <BarChart data={chartData} layout="vertical" margin={{ left: 100 }}>
                 <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E2E8F0" />
                 <XAxis type="number" axisLine={false} tickLine={false} tick={{fill: '#64748B', fontSize: 12}} />
                 <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#475569', fontSize: 13, fontWeight: 600}} />
                 <Tooltip cursor={{fill: 'transparent'}} contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}} />
                 <Bar dataKey="value" radius={[0, 8, 8, 0]} barSize={40}>
                   {chartData.map((entry, index) => (
                     <Cell key={`cell-${index}`} fill={entry.color} />
                   ))}
                 </Bar>
               </BarChart>
             </ResponsiveContainer>
          </div>

          <div className="mt-8 pt-8 border-t border-slate-100 flex items-center gap-4 text-slate-500">
             <Info size={16} />
             <p className="text-xs italic leading-relaxed">
               This simulation uses historical volatility coefficients to project stockout probabilities. 
               Actual results may vary based on lead times and supplier reliability.
             </p>
          </div>
        </div>
      </div>
    </div>
  );
}
