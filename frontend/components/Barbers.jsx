'use client';

import { motion } from 'framer-motion';
import { BARBERS } from '@/data/barbers';
import SectionHeading from '@/components/ui/SectionHeading';

export default function Barbers() {
  return (
    <section id="equipe" className="bg-steel/40 py-24 md:py-32 border-y border-white/5">
      <div className="mx-auto max-w-7xl px-6 md:px-10">
        <SectionHeading
          label="Equipe"
          title="Quem segura a navalha."
          description="Profissionais com anos de bancada, cada um com uma especialidade dentro do salao."
        />

        <div className="mt-14 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {BARBERS.map((barber, index) => (
            <motion.div
              key={barber.id}
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group"
            >
              <div className="aspect-[4/5] rounded-sm overflow-hidden border border-white/10 relative">
                {/* Substituir por /images/barbers/{id}.jpg com foto real do profissional */}
                <div
                  className="absolute inset-0 bg-cover bg-center grayscale group-hover:grayscale-0 transition-all duration-500"
                  style={{ backgroundImage: `url('/images/barbers/${barber.id}.jpg')` }}
                  role="img"
                  aria-label={barber.name}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-void via-void/10 to-transparent" />
                <div className="absolute left-0 right-0 bottom-0 h-px bg-gradient-to-r from-transparent via-cyan/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>

              <div className="mt-5">
                <h3 className="font-display text-lg text-bone">{barber.name}</h3>
                <p className="text-cyan text-sm mt-1">{barber.role}</p>
                <p className="text-muted text-sm mt-2 leading-relaxed">{barber.bio}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
