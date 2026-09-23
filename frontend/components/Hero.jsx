'use client';

import { motion } from 'framer-motion';

/**
 * A imagem de fundo (public/images/hero.jpg) deve ser substituida por uma
 * foto hiper-realista do interior da barbearia. Prompt sugerido para geracao
 * (Midjourney/DALL-E/Firefly): "Hyper-realistic photography of a modern
 * barbershop interior, dark theme, cyberpunk aesthetic, subtle neon lighting
 * in cyan and gold, sleek metallic barber chairs with futuristic design,
 * high quality, 8k resolution, cinematic lighting."
 */
export default function Hero() {
  return (
    <section id="inicio" className="relative min-h-screen flex items-center overflow-hidden bg-void">
      {/* Camada de fundo: imagem real do ambiente, com overlay para legibilidade do texto */}
      <div className="absolute inset-0">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('/images/hero.jpg')" }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-void via-void/85 to-void/40" />
        <div className="absolute inset-0 bg-gradient-to-t from-void via-transparent to-transparent" />
      </div>

      {/* Grade sutil para reforcar a estetica tecnologica, sem competir com a foto */}
      <div
        className="absolute inset-0 opacity-[0.07] pointer-events-none"
        style={{
          backgroundImage:
            'linear-gradient(rgba(0,229,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(0,229,255,0.6) 1px, transparent 1px)',
          backgroundSize: '56px 56px',
        }}
      />

      <div className="relative z-10 mx-auto max-w-7xl w-full px-6 md:px-10 pt-28 pb-20">
        <div className="max-w-2xl">
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-cyan text-sm font-medium mb-5"
          >
            Barbearia de precisao em Sao Paulo
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="font-display text-5xl sm:text-6xl lg:text-7xl font-semibold leading-[0.98] text-bone"
          >
            Cada corte,
            <br />
            uma linha exata.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="mt-6 text-lg text-muted max-w-md leading-relaxed"
          >
            Tecnica de navalha, ambiente autoral e agendamento confirmado na
            hora pelo WhatsApp. Sem fila, sem incerteza.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="mt-10 flex flex-wrap items-center gap-5"
          >
            <a
              href="/agendar"
              className="inline-flex items-center rounded-sm bg-cyan px-7 py-3.5 text-void font-semibold shadow-glowCyan hover:brightness-110 transition"
            >
              Agendar agora
            </a>
            <a
              href="/servicos"
              className="inline-flex items-center text-sm text-bone border-b border-white/20 pb-1 hover:border-cyan hover:text-cyan transition-colors"
            >
              Ver servicos e precos
            </a>
          </motion.div>
        </div>
      </div>

      <div className="absolute bottom-0 inset-x-0 laser-divider" />
    </section>
  );
}
