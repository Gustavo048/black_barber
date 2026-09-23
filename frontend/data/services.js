/**
 * Copia local do catalogo de servicos, usada como fallback caso a API esteja
 * indisponivel e como dado inicial para renderizacao no servidor (SSR),
 * evitando um layout vazio ate a chamada ao backend resolver no cliente.
 */
export const SERVICES = [
  { id: 'corte-classico', name: 'Corte Classico', durationMinutes: 40, price: 55, description: 'Corte tradicional com acabamento na navalha.' },
  { id: 'corte-degrade', name: 'Degrade Navalhado', durationMinutes: 50, price: 70, description: 'Fade de precisao com riscos e finalizacao a navalha.' },
  { id: 'barba-terapia', name: 'Barbaterapia', durationMinutes: 30, price: 45, description: 'Toalha quente, oleo e alinhamento completo da barba.' },
  { id: 'combo-corte-barba', name: 'Combo Corte + Barba', durationMinutes: 75, price: 100, description: 'O pacote completo: cabelo e barba na mesma sessao.' },
  { id: 'pigmentacao', name: 'Pigmentacao de Barba', durationMinutes: 45, price: 80, description: 'Preenchimento de falhas com pigmento profissional.' },
  { id: 'platinado', name: 'Platinado', durationMinutes: 120, price: 180, description: 'Descoloracao completa com tratamento pos-quimica.' },
  { id: 'sobrancelha', name: 'Design de Sobrancelha', durationMinutes: 15, price: 25, description: 'Alinhamento na navalha para um olhar mais definido.' },
];
