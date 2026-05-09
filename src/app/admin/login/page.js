"use client";

import { useState } from "react";
import { loginAdmin } from "../../../actions/auth";
import { Lock, User } from "lucide-react";

export default function LoginPage() {
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    
    const formData = new FormData(e.currentTarget);
    const res = await loginAdmin(formData);
    
    if (res?.error) {
      setError(res.error);
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 flex items-center justify-center p-6 relative">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-sky-900/20 rounded-full blur-[120px] pointer-events-none" />

      <div className="glass-card p-8 w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <div className="bg-sky-500/20 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-sky-500/30 shadow-[0_0_15px_rgba(14,165,233,0.2)]">
            <Lock className="text-sky-400 w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-white">Admin Login</h1>
          <p className="text-slate-400 text-sm mt-2">Masuk ke ruang kendali Studio Tugasmu</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm p-3 rounded-lg mb-6 text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm text-slate-300 mb-2 font-medium">Username</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-5 h-5" />
              <input 
                type="text" 
                name="username" 
                required 
                placeholder="Masukkan username" 
                className="w-full glass-input pl-10" 
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm text-slate-300 mb-2 font-medium">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-5 h-5" />
              <input 
                type="password" 
                name="password" 
                required 
                placeholder="••••••••" 
                className="w-full glass-input pl-10" 
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full bg-sky-500 hover:bg-sky-400 text-white font-bold py-3 rounded-lg shadow-lg transition-all mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Mengecek..." : "Masuk Dashboard"}
          </button>
        </form>
      </div>
    </main>
  );
}