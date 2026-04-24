import React, { useState } from "react";
import { useAuth } from "../App";
import { useNotify } from "../components/NotificationProvider";
import { User, Camera, Mail, User as UserIcon, Shield } from "lucide-react";
import { motion } from "motion/react";

export default function Profile() {
  const { user, login } = useAuth();
  const { notify } = useNotify();
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    // Simulate API call
    setTimeout(() => {
      login(email, name);
      setIsSaving(false);
      notify("Profile updated successfully", "success");
    }, 800);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Profile Settings</h2>
        <p className="text-slate-500">Manage your account information and preferences</p>
      </div>

      <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-sm overflow-hidden">
        <div className="h-32 bg-gradient-to-r from-blue-600 to-indigo-700"></div>
        <div className="px-8 pb-8">
          <div className="relative -mt-12 mb-8 flex justify-center">
            <div className="relative group">
              <div className="w-24 h-24 bg-white rounded-full p-1 shadow-lg">
                <div className="w-full h-full bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-3xl font-bold border-2 border-blue-50">
                  {name?.[0]?.toUpperCase() || "U"}
                </div>
              </div>
              <button className="absolute bottom-0 right-0 p-2 bg-white rounded-full shadow-md border border-slate-200 text-slate-600 hover:text-blue-600 transition-colors">
                <Camera size={16} />
              </button>
            </div>
          </div>

          <form onSubmit={handleSave} className="space-y-6">
            <div className="grid grid-cols-1 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                  <UserIcon size={16} className="text-slate-400" /> Full Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm"
                  placeholder="Enter your name"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                  <Mail size={16} className="text-slate-400" /> Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm"
                  placeholder="Enter your email"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                  <Shield size={16} className="text-slate-400" /> Role
                </label>
                <div className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-500 font-medium">
                  Administrator
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <button
                type="submit"
                disabled={isSaving}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-8 rounded-lg text-sm transition-all shadow-md shadow-blue-200 disabled:opacity-50"
              >
                {isSaving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        </div>
      </div>

      <div className="bg-red-50 border border-red-100 rounded-xl p-6">
        <h3 className="text-red-800 font-bold text-sm uppercase tracking-wider mb-2">Danger Zone</h3>
        <p className="text-red-600 text-xs mb-4">Once you delete your account, there is no going back. Please be certain.</p>
        <button className="text-red-700 hover:text-red-800 text-sm font-bold underline">
          Delete my account
        </button>
      </div>
    </div>
  );
}
