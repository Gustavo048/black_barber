/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './app/**/*.{js,jsx}',
    './components/**/*.{js,jsx}',
  ],
  theme: {
    extend: {
      colors: {
        void: '#0A0B0D',      // fundo principal (preto profundo)
        steel: '#161820',     // superficies / cards
        steel2: '#1F222C',    // superficies elevadas / hover
        bone: '#E8E6E1',      // texto principal (marfim frio, nao branco puro)
        muted: '#8A8D98',     // texto secundario
        cyan: '#00E5FF',      // acento de acao / precisao
        violet: '#B98CFF',    // acento secundario / holografico
        gold: '#D4AF37',      // acento premium / preco
      },
      fontFamily: {
        display: ['var(--font-display)', 'sans-serif'],
        body: ['var(--font-body)', 'sans-serif'],
      },
      boxShadow: {
        glowCyan: '0 0 25px -5px rgba(0, 229, 255, 0.45)',
        glowGold: '0 0 25px -5px rgba(212, 175, 55, 0.35)',
        glowViolet: '0 0 25px -5px rgba(185, 140, 255, 0.35)',
      },
      backgroundImage: {
        'grid-fade': 'linear-gradient(to bottom, transparent, #0A0B0D)',
      },
    },
  },
  plugins: [],
};
