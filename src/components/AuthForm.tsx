'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function AuthForm({onLogin}: {onLogin: (userId: string) => void}) {
  const [isLogin, setIsLogin] = useState(true); 
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '', full_name: '' });
  const [message, setMessage] = useState('');

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      if (isLogin) {
        // Login using Supabase Client directly
        const { data, error } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        });
        if (error) throw error;
        if (data.user) onLogin(data.user.id);
      } else {
       
        const res = await fetch('/api/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
        const data = await res.json();
        
        if (!data.success) throw new Error(data.error);
        
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        });
        if (authError) throw authError;
        if (authData.user) onLogin(authData.user.id);
      }
    } catch (error: any) {
      setMessage(error.message);
    } finally { 
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md p-8 space-y-6 bg-white rounded shadow-md dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
      <h2 className="text-2xl font-bold text-center">{isLogin ? 'Sign In' : 'Create Account'}</h2>
      {message && <p className="text-red-500 text-sm text-center">{message}</p>}
      
      <form onSubmit={handleAuth} className="space-y-4">
        {!isLogin && (
          <div>
            <label className="block text-sm font-medium">Full Name</label>
            <input
              type="text"
              className="w-full p-2 mt-1 border rounded bg-zinc-50 dark:bg-zinc-800 border-zinc-300 dark:border-zinc-700"
              value={formData.full_name}
              onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
            />
          </div>
        )}
        <div>
          <label className="block text-sm font-medium">Email</label>
          <input
            type="email"
            required
            className="w-full p-2 mt-1 border rounded bg-zinc-50 dark:bg-zinc-800 border-zinc-300 dark:border-zinc-700"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Password</label>
          <input
            type="password"
            required
            className="w-full p-2 mt-1 border rounded bg-zinc-50 dark:bg-zinc-800 border-zinc-300 dark:border-zinc-700"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          />
        </div>
        <button
          disabled={loading}
          type="submit"
          className="w-full py-2 font-bold text-white bg-blue-600 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Sign Up')}
        </button>
      </form>
      
      <div className="text-center">
        <button
          onClick={() => setIsLogin(!isLogin)}
          className="text-sm text-blue-500 hover:underline"
        >
          {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Sign In"}
        </button>
      </div>
    </div>
  );
}