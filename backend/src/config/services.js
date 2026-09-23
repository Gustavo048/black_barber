/**
 * Catalogo de servicos da barbearia.
 * Fonte unica de verdade usada pelo backend para validar/precificar
 * agendamentos e exposta via API para o frontend renderizar a secao de Servicos.
 */
const SERVICES = [
  { id: 'corte-classico', name: 'Corte Classico', durationMinutes: 40, price: 55 },
  { id: 'corte-degrade', name: 'Corte Degrade Navalhado', durationMinutes: 50, price: 70 },
  { id: 'barba-terapia', name: 'Barbaterapia', durationMinutes: 30, price: 45 },
  { id: 'combo-corte-barba', name: 'Combo Corte + Barba', durationMinutes: 75, price: 100 },
  { id: 'pigmentacao', name: 'Pigmentacao de Barba', durationMinutes: 45, price: 80 },
  { id: 'platinado', name: 'Platinado / Descoloracao', durationMinutes: 120, price: 180 },
  { id: 'sobrancelha', name: 'Design de Sobrancelha', durationMinutes: 15, price: 25 },
];

function findServiceById(id) {
  return SERVICES.find((service) => service.id === id) || null;
}

module.exports = { SERVICES, findServiceById };
