'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, Loader2, AlertCircle } from 'lucide-react';

export default function LoginPage() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      const data = await response.json();

      if (data.success) {
        // Redirect to dashboard
        router.push('/');
        router.refresh();
      } else {
        setError(data.error || '로그인에 실패했습니다');
      }
    } catch (err) {
      setError('로그인 처리 중 오류가 발생했습니다');
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-accent/20 rounded-2xl mb-4">
            <Lock className="w-8 h-8 text-accent" />
          </div>
          <h1 className="text-3xl font-display font-bold bg-gradient-to-r from-white via-white to-surface-200 bg-clip-text text-transparent">
            Dashboard
          </h1>
          <p className="text-surface-200 mt-2">
            비밀번호를 입력하여 계속하세요
          </p>
        </div>

        {/* Login Form */}
        <div className="card p-8 animate-slide-up">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Password Input */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium mb-2"
              >
                비밀번호
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-surface-900/50 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all duration-200"
                placeholder="비밀번호 입력"
                disabled={loading}
                autoFocus
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || !password}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-accent hover:bg-accent-light disabled:bg-surface-800 disabled:text-surface-200 rounded-xl font-medium transition-all duration-200 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>로그인 중...</span>
                </>
              ) : (
                <>
                  <Lock className="w-5 h-5" />
                  <span>로그인</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Footer */}
        <p className="text-center text-surface-200 text-sm mt-6">
          7일간 로그인 유지됩니다
        </p>
      </div>
    </main>
  );
}
