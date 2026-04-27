import React, { useState } from "react";
import { Link } from "react-router-dom";
import { 
  Search, 
  Filter, 
  ChevronRight, 
  MoreVertical,
  ArrowUpDown
} from "lucide-react";
import { useFetch } from "../../lib/hooks";
import { Product } from "../../types";
import { useSearch } from "../../App";

export default function ProductsList() {
  const { data: products, loading } = useFetch<Product[]>("/api/products");
  const { searchQuery: search, setSearchQuery: setSearch } = useSearch();
  const [filter, setFilter] = useState("All");

  if (loading || !products) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>;

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === "All" 
      || (filter === "Low Stock" && p.status === "Low")
      || (filter === "High Demand" && p.predictedDemand > 150);
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Inventory Directory</h2>
          <p className="text-slate-500">Manage and monitor all product lines</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 w-full md:w-64"
            />
          </div>
          <select 
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          >
            <option>All</option>
            <option>Low Stock</option>
            <option>High Demand</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-[#E2E8F0] bg-[#F1F5F9]">
              <th className="px-6 py-3 text-[11px] font-bold text-[#64748B] uppercase tracking-wider">Product Name</th>
              <th className="px-6 py-3 text-[11px] font-bold text-[#64748B] uppercase tracking-wider">Stock</th>
              <th className="px-6 py-3 text-[11px] font-bold text-[#64748B] uppercase tracking-wider text-center">Prediction</th>
              <th className="px-6 py-3 text-[11px] font-bold text-[#64748B] uppercase tracking-wider text-center">Status</th>
              <th className="px-6 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredProducts.map((product) => (
              <tr 
                key={product.id}
                className="hover:bg-[#F8FAFC] transition-colors cursor-pointer group"
              >
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-slate-100 rounded-md flex items-center justify-center text-slate-500 font-bold text-xs">
                      {product.name[0]}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-[#1E293B] group-hover:text-blue-600 transition-colors">
                        {product.name}
                      </p>
                      <p className="text-[10px] text-slate-400 font-medium uppercase tracking-tight">{product.category}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`text-sm font-medium ${product.stock < 50 ? 'text-red-600' : 'text-slate-600'}`}>
                    {product.stock}
                  </span>
                </td>
                <td className="px-6 py-4 text-center text-sm font-semibold text-[#1E293B]">
                  {product.predictedDemand}
                </td>
                <td className="px-6 py-4">
                  <div className="flex justify-center">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      product.status === 'Low' 
                        ? 'bg-[#FEE2E2] text-[#991B1B]' 
                        : 'bg-[#DCFCE7] text-[#166534]'
                    }`}>
                      {product.status}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <Link 
                    to={`/products/${product.id}`}
                    className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all inline-block"
                  >
                    <ChevronRight size={20} />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {filteredProducts.length === 0 && (
          <div className="p-12 text-center">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100">
              <Search className="text-slate-300" size={24} />
            </div>
            <p className="text-slate-500">No products found matching your search criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
}
