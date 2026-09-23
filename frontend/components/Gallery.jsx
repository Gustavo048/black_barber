'use client';

import { useRef } from 'react';
import { motion } from 'framer-motion';
import { GALLERY_ITEMS } from '@/data/gallery';
import SectionHeading from '@/components/ui/SectionHeading';

/**
 * Carrossel com scroll nativo (scroll-snap) em vez de uma lib de slider:
 * funciona em touch por padrao, sem JS extra, e os botoes apenas
 * complementam a navegacao para desktop/teclado.
 */
export default function Gallery() {
  const trackRef = useRef(null);

  function scrollByCard(direction) {
    const track = trackRef.current;
    if (!track) return;
    const card = track.querySelector('[data-card]');
    const cardWidth = card ? card.getBoundingClientRect().width + 16 : 320;
    track.scrollBy({ left: direction * cardWidth, behavior: 'smooth' });
  }

  return (
    <section id="galeria" className="bg-void py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-6 md:px-10">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6">
          <SectionHeading
            label="Portfolio"
            title="Resultados que falam por si."
            description="Uma amostra dos ultimos trabalhos realizados na barbearia."
          />
          <div className="flex gap-3 shrink-0">
            <button
              onClick={() => scrollByCard(-1)}
              aria-label="Anterior"
              className="h-11 w-11 flex items-center justify-center rounded-full border border-white/15 text-bone hover:border-cyan hover:text-cyan transition-colors"
            >
              ‹
            </button>
            <button
              onClick={() => scrollByCard(1)}
              aria-label="Proximo"
              className="h-11 w-11 flex items-center justify-center rounded-full border border-white/15 text-bone hover:border-cyan hover:text-cyan transition-colors"
            >
              ›
            </button>
          </div>
        </div>

        <div
          ref={trackRef}
          className="mt-12 flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
        >
          {GALLERY_ITEMS.map((item, index) => (
            <motion.div
              key={item.id}
              data-card
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.45, delay: (index % 4) * 0.06 }}
              className="snap-start shrink-0 w-[280px] sm:w-[320px] aspect-[3/4] rounded-sm overflow-hidden border border-white/10 relative group"
            >
              {/* Substituir por /images/gallery/{item.id}.jpg com fotos reais do portfolio */}
              <div
                className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
                style={{ backgroundImage: `url('/images/gallery/${item.id}.jpg')` }}
                role="img"
                aria-label={item.alt}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-void/80 via-transparent to-transparent" />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
