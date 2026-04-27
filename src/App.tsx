import React, { createContext, useContext, useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { 
  LayoutDashboard, 
  Package, 
  LineChart, 
  Zap, 
  BarChart3, 
  LogOut, 
  Menu, 
  X,
  Bell,
  Search,
  User as UserIcon,
  ChevronRight,
  ShoppingCart
} from "lucide-react";
import { User } from "./types";
import { NotificationProvider } from "./components/NotificationProvider";

// Page Imports
import Login from "./pages/Auth/Login";
import Signup from "./pages/Auth/Signup";
import Dashboard from "./pages/Dashboard";
import Products from "./pages/Products/ProductsList";
import ProductDetail from "./pages/Products/ProductDetail";
import Forecast from "./pages/Forecast";
import Recommendations from "./pages/Recommendations";
import Simulation from "./pages/Simulation";
import Profile from "./pages/Profile";
import Orders from "./pages/Orders";

// Search Context
interface SearchContextType {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

const SearchContext = createContext<SearchContextType | undefined>(undefined);

export function SearchProvider({ children }: { children: React.ReactNode }) {
  const [searchQuery, setSearchQuery] = useState("");
  return (
    <SearchContext.Provider value={{ searchQuery, setSearchQuery }}>
      {children}
    </SearchContext.Provider>
  );
}

export const useSearch = () => {
  const context = useContext(SearchContext);
  if (!context) throw new Error("useSearch must be used within SearchProvider");
  return context;
};

// Auth Context
interface AuthContextType {
  user: User | null;
  login: (email: string, name: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem("suppl_ai_user");
    return saved ? JSON.parse(saved) : null;
  });

  const login = (email: string, name: string) => {
    const newUser = { id: Math.random().toString(36).substr(2, 9), email, name };
    setUser(newUser);
    localStorage.setItem("suppl_ai_user", JSON.stringify(newUser));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("suppl_ai_user");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};

// Layout Component
function Sidebar() {
  const { user, logout } = useAuth();
  const location = useLocation();

  const menuItems = [
    { name: "Dashboard", path: "/", icon: LayoutDashboard },
    { name: "Products", path: "/products", icon: Package },
    { name: "Forecast", path: "/forecast", icon: LineChart },
    { name: "Recommendations", path: "/recommendations", icon: Zap },
    { name: "Simulation", path: "/simulation", icon: BarChart3 },
    { name: "Orders", path: "/orders", icon: ShoppingCart },
  ];

  return (
    <div className="w-[220px] bg-[#0F172A] flex flex-col h-screen fixed left-0 top-0 z-50">
      <div className="p-6">
        <div className="flex items-center gap-2 text-white font-extrabold text-2xl mb-8 tracking-tighter">
          <span className="text-blue-500">Suppl</span>AI
        </div>
        
        <nav className="space-y-1">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 text-sm ${
                location.pathname === item.path
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-900/20"
                  : "text-slate-400 hover:bg-slate-800/50 hover:text-white"
              }`}
            >
              <item.icon size={18} className={location.pathname === item.path ? "opacity-100" : "opacity-70"} />
              <span>{item.name}</span>
            </Link>
          ))}
        </nav>
      </div>

      <div className="mt-auto p-4 border-t border-slate-800">
        <Link to="/profile" className="block px-4 py-2 mb-4 hover:bg-slate-800/50 rounded-lg transition-colors group">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest group-hover:text-slate-400">Logged in as</p>
          <p className="text-xs text-slate-300 truncate group-hover:text-white">{user?.name || "Admin User"}</p>
        </Link>
        <button
          onClick={logout}
          className="flex items-center gap-3 px-4 py-3 w-full text-slate-400 hover:text-red-400 hover:bg-red-950/30 rounded-lg transition-colors text-sm"
        >
          <LogOut size={18} />
          <span>Logout System</span>
        </button>
      </div>
    </div>
  );
}

function MainLayout({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const { searchQuery, setSearchQuery } = useSearch();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    if (location.pathname !== "/products" && e.target.value.trim() !== "") {
      navigate("/products");
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <Sidebar />
      
      <div className="pl-[220px] flex flex-col">
        {/* Header */}
        <header className="h-16 bg-white border-b border-[#E2E8F0] flex items-center justify-between px-8 sticky top-0 z-40">
          <div className="flex items-center gap-4">
             <div className="relative md:block hidden">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input 
                type="text" 
                placeholder="Search inventory..." 
                value={searchQuery}
                onChange={handleSearchChange}
                className="pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 w-80 transition-all"
              />
             </div>
          </div>
          
          <div className="flex items-center gap-6">
            <button className="text-slate-400 hover:text-slate-600 p-2 rounded-full hover:bg-slate-50 relative transition-colors">
              <Bell size={18} />
              <span className="absolute top-2.5 right-2.5 w-1.5 h-1.5 bg-blue-600 rounded-full border-2 border-white"></span>
            </button>
            
            <div className="flex items-center gap-3 pl-6 border-l border-slate-200">
              <Link 
                to="/profile"
                className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-xs shadow-md shadow-blue-200 hover:bg-blue-700 transition-colors"
              >
                {user?.name?.[0].toUpperCase()}
              </Link>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="p-8 max-w-[1440px] w-full mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={window.location.pathname}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.15 }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}

// Protected Route Guard
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return <ProtectedRouteInner>{children}</ProtectedRouteInner>;
}

function ProtectedRouteInner({ children }: { children: React.ReactNode }) {
  return <MainLayout>{children}</MainLayout>;
}

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <SearchProvider>
          <NotificationProvider>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              
              <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/products" element={<ProtectedRoute><Products /></ProtectedRoute>} />
              <Route path="/products/:id" element={<ProtectedRoute><ProductDetail /></ProtectedRoute>} />
              <Route path="/forecast" element={<ProtectedRoute><Forecast /></ProtectedRoute>} />
              <Route path="/recommendations" element={<ProtectedRoute><Recommendations /></ProtectedRoute>} />
              <Route path="/simulation" element={<ProtectedRoute><Simulation /></ProtectedRoute>} />
              <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
              <Route path="/orders" element={<ProtectedRoute><Orders /></ProtectedRoute>} />
              
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </NotificationProvider>
        </SearchProvider>
      </AuthProvider>
    </Router>
  );
}
