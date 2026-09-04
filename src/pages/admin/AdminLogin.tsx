import React, { useState } from 'react';
import { Shield, Key, ArrowRight, AlertCircle, User } from 'lucide-react';
import { ApiService } from '../../services/api';

interface AdminLoginProps {
  onLoginSuccess: () => void;
  onNavigate: (view: string) => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ onLoginSuccess, onNavigate }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await ApiService.adminLogin(username, password);
      if (res.success) {
        onLoginSuccess();
      } else {
        setError('Authentication failed. Please verify admin credentials.');
      }
    } catch (err: any) {
      setError(err.message || 'Authentication error. Please check credentials and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="admin-login-view" className="max-w-md mx-auto my-16 p-6 sm:p-8 bg-[#0A0A0A] border border-[#D4A017] rounded-2xl shadow-[0_0_25px_rgba(212,160,23,0.25)] space-y-6 text-white">
      <div className="text-center space-y-2">
        <div className="w-12 h-12 bg-[#141414] text-[#D4A017] border border-[#D4A017] rounded-xl flex items-center justify-center mx-auto shadow-[0_0_10px_rgba(212,160,23,0.2)]">
          <Shield className="w-6 h-6" />
        </div>

        <h1 className="text-2xl font-serif font-bold text-white">Store Admin Login</h1>
        <p className="text-xs text-[#A3A3A3]">
          Management Portal for JSArt&Decor Products, Orders, and Settings
        </p>
      </div>

      {error && (
        <div className="p-3 bg-red-950/60 border border-red-500 rounded-xl flex items-center gap-2 text-xs text-red-200">
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleLogin} className="space-y-4 text-xs">
        <div>
          <label className="block font-bold text-[#CCCCCC] mb-1">Admin Username</label>
          <div className="relative">
            <input
              type="text"
              required
              placeholder="Enter admin username"
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
                setError(null);
              }}
              className="w-full bg-[#141414] border border-[#333333] focus:border-[#D4A017] rounded-lg pl-3 pr-10 py-3 text-white placeholder:text-neutral-500 focus:outline-none"
            />
            <User className="w-4 h-4 text-[#D4A017] absolute right-3 top-1/2 -translate-y-1/2" />
          </div>
        </div>

        <div>
          <label className="block font-bold text-[#CCCCCC] mb-1">Admin Password</label>
          <div className="relative">
            <input
              type="password"
              required
              placeholder="Enter admin password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError(null);
              }}
              className="w-full bg-[#141414] border border-[#333333] focus:border-[#D4A017] rounded-lg pl-3 pr-10 py-3 text-white placeholder:text-neutral-500 focus:outline-none"
            />
            <Key className="w-4 h-4 text-[#D4A017] absolute right-3 top-1/2 -translate-y-1/2" />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3.5 bg-[#D4A017] hover:bg-[#E5B842] text-black font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition disabled:opacity-50 shadow-[0_0_15px_rgba(212,160,23,0.3)]"
        >
          <span>{loading ? 'Authenticating...' : 'Access Portal'}</span>
          <ArrowRight className="w-4 h-4 text-black" />
        </button>
      </form>

      <div className="pt-2 text-center">
        <button
          onClick={() => onNavigate('home')}
          className="text-xs text-neutral-500 hover:text-neutral-900"
        >
          Return to Customer Storefront
        </button>
      </div>
    </div>
  );
};
