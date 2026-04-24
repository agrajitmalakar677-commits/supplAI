import React, { useState } from "react";
import { useFetch } from "../lib/hooks";
import { Product } from "../types";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from "recharts";

export default function Forecast() {
  const { data: products, loading } = useFetch<Product[]>("/api/products");
  const [selectedProductId, setSelectedProductId] = useState<string>("");

  const productsLoaded = products && products.length > 0;
  
  // Set default selection
  React.useEffect(() => {
    if (productsLoaded && !selectedProductId) {
      setSelectedProductId(products[0].id);
    }
  }, [productsLoaded, selectedProductId, products]);

  const selectedProduct = products?.find(p => p.id === selectedProductId);

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>;

  const chartData = selectedProduct ? [
    ...selectedProduct.salesHistory.map((val, i) => ({
      name: `T-${selectedProduct.salesHistory.length - i}`,
      value: val,
      type: 'Actual'
    })),
    { name: 'Future Week 1', value: selectedProduct.predictedDemand * 0.9, type: 'Forecast' },
    { name: 'Future Week 2', value: selectedProduct.predictedDemand, type: 'Forecast' },
    { name: 'Future Week 3', value: selectedProduct.predictedDemand * 1.1, type: 'Forecast' },
  ] : [];

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Demand Forecasting</h2>
          <p className="text-slate-500">Select a product to view AI-projected demand curves</p>
        </div>

        <select 
          value={selectedProductId}
          onChange={(e) => setSelectedProductId(e.target.value)}
          className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 border-r-8 border-r-transparent"
        >
          {products?.map(p => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
      </div>

      {selectedProduct && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-3 bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900 mb-8">Long-term Demand Projection</h3>
            <div className="h-[450px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="forecastGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563EB" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#2563EB" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fill: '#64748B', fontSize: 12}} 
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fill: '#64748B', fontSize: 12}} 
                  />
                  <Tooltip 
                    contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)'}}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="value" 
                    stroke="#2563EB" 
                    strokeWidth={3}
                    fillOpacity={1} 
                    fill="url(#forecastGrad)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Projection Stats</h4>
              <div className="space-y-4">
                <div>
                  <p className="text-slate-500 text-sm">Confidence Level</p>
                  <p className="text-2xl font-bold text-slate-900">94.2%</p>
                </div>
                <div>
                  <p className="text-slate-500 text-sm">Peak Demand (Est.)</p>
                  <p className="text-2xl font-bold text-slate-900">{Math.round(selectedProduct.predictedDemand * 1.1)}</p>
                </div>
                <div>
                  <p className="text-slate-500 text-sm">Growth Trend</p>
                  <p className="text-2xl font-bold text-green-600">+18.5%</p>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100">
              <h4 className="text-sm font-bold text-blue-900 mb-2">Model Version</h4>
              <p className="text-sm text-blue-700 leading-relaxed">
                Using <span className="font-bold">DemandV2-Neural</span> optimized for Hair Care category seasonal patterns.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
