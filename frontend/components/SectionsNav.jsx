'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';

const ITEMS = [
  { href: '/servicos', title: 'Servicos', description: 'Cortes, barba e coloracao, com preco e tempo fechados.' },
  { href: '/agendar', title: 'Agendar', description: 'Escolha o horario e receba a confirmacao no WhatsApp.' },
  { href: '/galeria', title: 'Galeria', description: 'Veja o resultado dos ultimos trabalhos realizados.' },
  { href: '/equipe', title: 'Equipe', description: 'Conheca os profissionais e suas especialidades.' },
];

/**
 * Substitui, na home, o scroll continuo por seccoes: agora cada bloco de
 * conteudo vive na propria pagina, entao a home oferece pontos de entrada
 * claros para elas logo apos o Hero.
 */
export default function SectionsNav() {
  return (
    <section className="bg-void py-20 md:py-28 border-t border-white/5">
      <div className="mx-auto max-w-7xl px-6 md:px-10">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-px bg-white/5">
          {ITEMS.map((item, index) => (
            <motion.div
              key={item.href}
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.45, delay: index * 0.07 }}
              className="bg-void"
            >
              <Link
                href={item.href}
                className="group h-full flex flex-col justify-between p-8 min-h-[190px] hover:bg-steel/60 transition-colors"
              >
                <h3 className="font-display text-xl text-bone group-hover:text-cyan transition-colors">
                  {item.title}
                </h3>
                <p className="text-sm text-muted leading-relaxed mt-3">{item.description}</p>
                <span className="mt-6 text-sm text-cyan opacity-0 group-hover:opacity-100 transition-opacity">
                  Ver mais
                </span>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
