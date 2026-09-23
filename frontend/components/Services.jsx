'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { fetchServices } from '@/lib/api';
import { SERVICES as FALLBACK_SERVICES } from '@/data/services';
import SectionHeading from '@/components/ui/SectionHeading';

const priceFormatter = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

export default function Services() {
  const [services, setServices] = useState(FALLBACK_SERVICES);

  useEffect(() => {
    let cancelled = false;
    fetchServices()
      .then((data) => {
        if (!cancelled && data.services?.length) setServices(data.services);
      })
      .catch(() => {
        // Mantem o fallback local silenciosamente; a API pode nao estar no ar em preview.
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section id="servicos" className="bg-void py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-6 md:px-10">
        <SectionHeading
          label="Servicos"
          title="Tecnica clara, preco fechado."
          description="Cada servico inclui o tempo estimado de atendimento para voce planejar sua agenda sem surpresas."
        />

        <div className="mt-14 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-white/5">
          {services.map((service, index) => (
            <motion.div
              key={service.id}
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.5, delay: (index % 3) * 0.08 }}
              className="bg-void p-8 flex flex-col justify-between min-h-[220px] group hover:bg-steel/60 transition-colors"
            >
              <div>
                <h3 className="font-display text-xl text-bone group-hover:text-cyan transition-colors">
                  {service.name}
                </h3>
                {service.description && (
                  <p className="mt-3 text-sm text-muted leading-relaxed">{service.description}</p>
                )}
              </div>

              <div className="mt-8 flex items-end justify-between">
                <span className="text-xs text-muted">{service.durationMinutes} min</span>
                <span className="font-display text-2xl text-gold">
                  {priceFormatter.format(service.price)}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
