import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FileText,
  ArrowRight,
  Loader2,
  Sparkles,
  Shield,
  Zap,
  Check,
} from 'lucide-react';
import { useAuthStore } from '../../stores/auth.store';
import { apiClient } from '@/shared/api-client/axios';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [selectedDemo, setSelectedDemo] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const response = await apiClient.post('/auth/login', {
        email,
        password,
      });

      const { user, token } = response.data.data;
      setAuth(user, token);
      navigate('/');
    } catch (err: any) {
      setErrorMessage(
        err.response?.data?.message || 'Login failed. Please check your credentials.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickLogin = (demoEmail: string, name: string) => {
    setEmail(demoEmail);
    setPassword('Password123!');
    setSelectedDemo(name);
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-[#FAFAFA] bg-dot-pattern px-4 py-12 overflow-hidden">
      {/* Ambient Gradient Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-violet-400/20 via-indigo-300/20 to-purple-200/20 blur-3xl rounded-full pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="relative w-full max-w-[440px] z-10"
      >
        {/* Top Feature Pill */}
        <div className="flex justify-center mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-zinc-200/80 shadow-subtle text-xs font-medium text-zinc-700">
            <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>CollabDocs Studio v1.0</span>
          </div>
        </div>

        {/* Card Container */}
        <div className="bg-white/90 backdrop-blur-xl rounded-3xl p-8 sm:p-9 shadow-float border border-zinc-200/80">
          {/* Brand Header */}
          <div className="flex flex-col items-center text-center mb-8">
            <div className="w-12 h-12 rounded-2xl bg-zinc-950 text-white flex items-center justify-center shadow-md mb-3.5">
              <FileText className="w-6 h-6 stroke-[2.2]" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-zinc-900">
              Welcome back
            </h1>
            <p className="text-sm text-zinc-500 mt-1">
              Sign in to your collaborative workspace
            </p>
          </div>

          {/* Error Banner */}
          {errorMessage && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-5 p-3.5 rounded-md bg-red-50/80 border border-red-200/80 text-red-600 text-xs font-medium flex items-center gap-2"
            >
              <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
              <span>{errorMessage}</span>
            </motion.div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="alice@example.com"
                className="w-full px-4 py-2.5 rounded-md border border-zinc-200 bg-white/80 text-zinc-900 text-sm placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-600 transition shadow-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-1.5">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full px-4 py-2.5 rounded-md border border-zinc-200 bg-white/80 text-zinc-900 text-sm placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-600 transition shadow-xs"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-3 px-4 rounded-md bg-zinc-900 hover:bg-zinc-800 active:scale-[0.99] text-white font-semibold text-sm shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed group cursor-pointer"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-zinc-400" />
                  <span>Signing in...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </>
              )}
            </button>
          </form>

          {/* Quick Reviewer Demo Accounts */}
          <div className="mt-8 pt-6 border-t border-zinc-100">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                1-Click Reviewer Access
              </span>
              <span className="text-[10px] text-violet-600 font-semibold bg-violet-50 px-2 py-0.5 rounded-full">
                Pre-seeded
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              {/* Alice */}
              <button
                type="button"
                onClick={() => handleQuickLogin('alice@example.com', 'Alice')}
                className={`p-3 rounded-2xl border text-left transition-all relative overflow-hidden group cursor-pointer ${
                  selectedDemo === 'Alice'
                    ? 'border-violet-500 bg-violet-50/60 shadow-xs'
                    : 'border-zinc-200/80 hover:border-zinc-300 bg-zinc-50/50 hover:bg-white'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-6 h-6 rounded-full bg-violet-600 text-white flex items-center justify-center text-[10px] font-bold">
                    A
                  </div>
                  <span className="text-xs font-bold text-zinc-800 group-hover:text-violet-600 transition">
                    Alice
                  </span>
                </div>
                <div className="text-[11px] text-zinc-400 truncate">
                  alice@example.com
                </div>
                <div className="mt-1.5 flex items-center gap-1 text-[10px] text-violet-600 font-semibold">
                  <span>Owner Mode</span>
                  {selectedDemo === 'Alice' && <Check className="w-3 h-3" />}
                </div>
              </button>

              {/* Bob */}
              <button
                type="button"
                onClick={() => handleQuickLogin('bob@example.com', 'Bob')}
                className={`p-3 rounded-2xl border text-left transition-all relative overflow-hidden group cursor-pointer ${
                  selectedDemo === 'Bob'
                    ? 'border-amber-500 bg-amber-50/60 shadow-xs'
                    : 'border-zinc-200/80 hover:border-zinc-300 bg-zinc-50/50 hover:bg-white'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-6 h-6 rounded-full bg-amber-600 text-white flex items-center justify-center text-[10px] font-bold">
                    B
                  </div>
                  <span className="text-xs font-bold text-zinc-800 group-hover:text-amber-600 transition">
                    Bob
                  </span>
                </div>
                <div className="text-[11px] text-zinc-400 truncate">
                  bob@example.com
                </div>
                <div className="mt-1.5 flex items-center gap-1 text-[10px] text-amber-600 font-semibold">
                  <span>Collaborator</span>
                  {selectedDemo === 'Bob' && <Check className="w-3 h-3" />}
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="text-center mt-6 text-xs text-zinc-400">
          Crafted for high-fidelity document collaboration & review.
        </div>
      </motion.div>
    </div>
  );
};
