'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { login, setToken } from '@/lib/adminApi';

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus('submitting');
    setError(null);

    try {
      const data = await login(username, password);
      setToken(data.token);
      router.replace('/admin');
    } catch (err) {
      setStatus('idle');
      setError(err.message);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-void px-6">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm bg-steel/40 border border-white/10 rounded-sm p-8 space-y-6"
      >
        <div>
          <h1 className="font-display text-2xl text-bone">
            Blackline<span className="text-cyan">.</span>
          </h1>
          <p className="text-sm text-muted mt-2">Acesso restrito da equipe.</p>
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="username" className="text-sm text-muted">
            Usuario
          </label>
          <input
            id="username"
            required
            autoFocus
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="input"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="password" className="text-sm text-muted">
            Senha
          </label>
          <input
            id="password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input"
          />
        </div>

        <button
          type="submit"
          disabled={status === 'submitting'}
          className="w-full inline-flex justify-center rounded-sm bg-cyan text-void font-semibold py-3 hover:brightness-110 transition disabled:opacity-60"
        >
          {status === 'submitting' ? 'Entrando...' : 'Entrar'}
        </button>

        {error && <p className="text-sm text-red-300">{error}</p>}
      </form>
    </main>
  );
}
