/**
 * Equipe de barbeiros disponivel para agendamento.
 *
 * "phone" e opcional (E.164 sem "+", ex.: "5511988887777"). Se preenchido, o
 * proprio barbeiro recebe a notificacao automatica de novo agendamento; se
 * ficar null, a notificacao vai para ADMIN_WHATSAPP_NUMBER (ver .env).
 */
const BARBERS = [
  { id: 'rafael', name: 'Rafael Souza', role: 'Mestre Barbeiro', avatar: '/images/barbers/rafael.jpg', phone: null },
  { id: 'lucas', name: 'Lucas Andrade', role: 'Especialista em Navalha', avatar: '/images/barbers/lucas.jpg', phone: null },
  { id: 'diego', name: 'Diego Martins', role: 'Colorista / Platinados', avatar: '/images/barbers/diego.jpg', phone: null },
];

function findBarberById(id) {
  return BARBERS.find((barber) => barber.id === id) || null;
}

module.exports = { BARBERS, findBarberById };
