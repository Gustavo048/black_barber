'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getToken } from '@/lib/adminApi';

/**
 * Envolve as paginas do painel: se nao houver token salvo, manda para o
 * login antes de renderizar qualquer coisa. A validade real do token quem
 * garante e o backend (requireAuth) — isso aqui e so a primeira barreira de
 * UX para nao piscar dados antes do redirecionamento.
 */
export default function AdminGuard({ children }) {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!getToken()) {
      router.replace('/admin/login');
      return;
    }
    setReady(true);
  }, [router]);

  if (!ready) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-void">
        <p className="text-sm text-muted">Carregando...</p>
      </main>
    );
  }

  return children;
}
