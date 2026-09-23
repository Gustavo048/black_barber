'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

// Paginas de conteudo (cada secao virou uma rota). "Contato" nao tem pagina
// propria: e uma ancora para o rodape, que fica presente em todas as paginas.
const PAGE_LINKS = [
  { href: '/servicos', label: 'Servicos' },
  { href: '/agendar', label: 'Agendar' },
  { href: '/galeria', label: 'Galeria' },
  { href: '/equipe', label: 'Equipe' },
];

export default function Navbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => setOpen(false), [pathname]);

  const isHome = pathname === '/';

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-colors duration-300 ${
        scrolled || !isHome ? 'bg-void/90 backdrop-blur border-b border-white/5' : 'bg-transparent'
      }`}
    >
      <nav className="mx-auto max-w-7xl px-6 md:px-10 h-20 flex items-center justify-between">
        <Link href="/" className="font-display text-xl tracking-tight text-bone">
          Blackline<span className="text-cyan">.</span>
        </Link>

        <ul className="hidden md:flex items-center gap-8">
          {PAGE_LINKS.map((link) => {
            const active = pathname === link.href;
            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={`text-sm transition-colors ${
                    active ? 'text-cyan' : 'text-muted hover:text-bone'
                  }`}
                >
                  {link.label}
                </Link>
              </li>
            );
          })}
          <li>
            <a href="#contato" className="text-sm text-muted hover:text-bone transition-colors">
              Contato
            </a>
          </li>
        </ul>

        <Link
          href="/agendar"
          className="hidden md:inline-flex items-center rounded-sm border border-cyan/60 px-5 py-2 text-sm font-medium text-cyan hover:bg-cyan hover:text-void transition-colors"
        >
          Agendar agora
        </Link>

        <button
          onClick={() => setOpen((v) => !v)}
          aria-label="Abrir menu"
          aria-expanded={open}
          className="md:hidden text-bone p-2"
        >
          <span className="block w-6 h-px bg-bone mb-1.5" />
          <span className="block w-6 h-px bg-bone mb-1.5" />
          <span className="block w-4 h-px bg-bone" />
        </button>
      </nav>

      {open && (
        <div className="md:hidden bg-void border-t border-white/5 px-6 py-6 flex flex-col gap-5">
          {PAGE_LINKS.map((link) => (
            <Link key={link.href} href={link.href} className="text-base text-bone">
              {link.label}
            </Link>
          ))}
          <a href="#contato" onClick={() => setOpen(false)} className="text-base text-bone">
            Contato
          </a>
          <Link
            href="/agendar"
            className="inline-flex justify-center rounded-sm bg-cyan text-void font-medium py-3"
          >
            Agendar agora
          </Link>
        </div>
      )}
    </header>
  );
}
