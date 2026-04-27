import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Zap } from "lucide-react";
import { useAuth } from "../../App";

export default function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }
    login(email, name);
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl shadow-slate-200/60 p-8 border border-slate-100">
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-white mb-4 shadow-lg shadow-blue-200">
            <Zap className="fill-current" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Create Account</h1>
          <p className="text-slate-500 mt-2">Start optimizing your supply chain today</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Full Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              placeholder="John Doe"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              placeholder="name@company.com"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              placeholder="••••••••"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Confirm Password</label>
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 active:scale-[0.98] transition-all shadow-lg shadow-blue-200/50 mt-4"
          >
            Create Account
          </button>
        </form>

        <p className="mt-8 text-center text-slate-500 text-sm">
          Already have an account?{" "}
          <Link to="/login" className="text-blue-600 font-semibold hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
