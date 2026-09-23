process.env.MESSAGING_PROVIDER = 'mock';

const request = require('supertest');
const express = require('express');
const routes = require('../src/routes');
const { errorHandler, notFoundHandler } = require('../src/middleware/errorHandler');

function buildApp() {
  const app = express();
  app.use(express.json());
  app.use('/api', routes);
  app.use(notFoundHandler);
  app.use(errorHandler);
  return app;
}

/** Proxima data futura que cai em um dia da semana especifico (0=domingo...6=sabado). */
function nextWeekday(targetDow) {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  while (d.getDay() !== targetDow) d.setDate(d.getDate() + 1);
  return d.toISOString().slice(0, 10);
}

describe('GET /api/availability', () => {
  const app = buildApp();
  const monday = nextWeekday(1);
  const sunday = nextWeekday(0);

  it('retorna open:false para um dia fechado (domingo)', async () => {
    const res = await request(app).get(`/api/availability?date=${sunday}&serviceId=corte-classico`);
    expect(res.status).toBe(200);
    expect(res.body.open).toBe(false);
  });

  it('retorna slots com todos os barbeiros livres em um dia sem agendamentos', async () => {
    const res = await request(app).get(`/api/availability?date=${monday}&serviceId=corte-classico`);
    expect(res.status).toBe(200);
    expect(res.body.open).toBe(true);
    expect(res.body.slots.length).toBeGreaterThan(0);
    expect(res.body.slots[0].availableBarbers.length).toBe(3);
  });

  it('rejeita requisicao sem serviceId', async () => {
    const res = await request(app).get(`/api/availability?date=${monday}`);
    expect(res.status).toBe(400);
  });
});

describe('Conflito de agendamento (integracao criar + disponibilidade)', () => {
  const app = buildApp();
  const tuesday = nextWeekday(2);

  const firstBooking = {
    customerName: 'Cliente A',
    customerPhone: '5511999990001',
    serviceId: 'corte-classico', // 40 minutos
    barberId: 'rafael',
    date: tuesday,
    time: '10:00',
  };

  it('cria o primeiro agendamento com sucesso', async () => {
    const res = await request(app).post('/api/bookings').send(firstBooking);
    expect(res.status).toBe(201);
    expect(res.body.booking.barberId).toBe('rafael');
  });

  it('recusa (409) um segundo agendamento com o mesmo barbeiro em horario que colide', async () => {
    const res = await request(app)
      .post('/api/bookings')
      .send({ ...firstBooking, customerName: 'Cliente B', customerPhone: '5511999990002', time: '10:20' });

    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
  });

  it('aceita um segundo cliente no mesmo horario, mas com outro barbeiro', async () => {
    const res = await request(app)
      .post('/api/bookings')
      .send({ ...firstBooking, customerName: 'Cliente C', customerPhone: '5511999990003', barberId: 'lucas' });

    expect(res.status).toBe(201);
    expect(res.body.booking.barberId).toBe('lucas');
  });

  it('sem preferencia de barbeiro, atribui automaticamente um profissional livre', async () => {
    const res = await request(app)
      .post('/api/bookings')
      .send({ ...firstBooking, customerName: 'Cliente D', customerPhone: '5511999990004', barberId: undefined });

    expect(res.status).toBe(201);
    expect(['diego']).toContain(res.body.booking.barberId); // rafael e lucas ja ocupados nesse horario
  });

  it('recusa quando nao ha nenhum barbeiro livre no horario', async () => {
    const res = await request(app)
      .post('/api/bookings')
      .send({ ...firstBooking, customerName: 'Cliente E', customerPhone: '5511999990005', barberId: undefined });

    expect(res.status).toBe(409);
  });
});
