process.env.MESSAGING_PROVIDER = 'mock';
process.env.ADMIN_USERNAME = 'admin';
process.env.JWT_SECRET = 'test-secret-key';
process.env.JWT_EXPIRES_IN = '1h';

const bcrypt = require('bcryptjs');
process.env.ADMIN_PASSWORD_HASH = bcrypt.hashSync('senha-correta-123', 10);

const request = require('supertest');
const express = require('express');
const routes = require('../src/routes');
const { errorHandler, notFoundHandler } = require('../src/middleware/errorHandler');
const bookingRepository = require('../src/repositories/bookingRepository');

function buildApp() {
  const app = express();
  app.use(express.json());
  app.use('/api', routes);
  app.use(notFoundHandler);
  app.use(errorHandler);
  return app;
}

function nextWeekday(targetDow) {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  while (d.getDay() !== targetDow) d.setDate(d.getDate() + 1);
  return d.toISOString().slice(0, 10);
}

describe('POST /api/auth/login', () => {
  const app = buildApp();

  it('recusa credenciais invalidas', async () => {
    const res = await request(app).post('/api/auth/login').send({ username: 'admin', password: 'errada' });
    expect(res.status).toBe(401);
  });

  it('aceita credenciais corretas e devolve um token', async () => {
    const res = await request(app).post('/api/auth/login').send({ username: 'admin', password: 'senha-correta-123' });
    expect(res.status).toBe(200);
    expect(res.body.token).toBeTruthy();
  });
});

describe('Rotas administrativas protegidas', () => {
  const app = buildApp();
  const wednesday = nextWeekday(3);
  let token;
  let bookingId;

  beforeAll(async () => {
    const loginRes = await request(app).post('/api/auth/login').send({ username: 'admin', password: 'senha-correta-123' });
    token = loginRes.body.token;

    const bookingRes = await request(app).post('/api/bookings').send({
      customerName: 'Cliente Teste',
      customerPhone: '5511999990009',
      serviceId: 'corte-classico',
      barberId: 'rafael',
      date: wednesday,
      time: '11:00',
    });
    bookingId = bookingRes.body.booking.id;
  });

  it('GET /api/bookings sem token retorna 401', async () => {
    const res = await request(app).get('/api/bookings');
    expect(res.status).toBe(401);
  });

  it('GET /api/bookings com token retorna a lista', async () => {
    const res = await request(app).get('/api/bookings').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.bookings)).toBe(true);
    expect(res.body.bookings.length).toBeGreaterThan(0);
  });

  it('grava o preco e o nome do servico no momento do agendamento (snapshot)', async () => {
    const res = await request(app).get('/api/bookings').set('Authorization', `Bearer ${token}`);
    const created = res.body.bookings.find((b) => b.id === bookingId);
    expect(created.servicePrice).toBe(55);
    expect(created.serviceName).toBe('Corte Classico');
    expect(created.barberName).toBe('Rafael Souza');
  });

  it('PATCH /api/bookings/:id/status sem token retorna 401', async () => {
    const res = await request(app).patch(`/api/bookings/${bookingId}/status`).send({ status: 'atendido' });
    expect(res.status).toBe(401);
  });

  it('PATCH /api/bookings/:id/status marca como atendido', async () => {
    const res = await request(app)
      .patch(`/api/bookings/${bookingId}/status`)
      .set('Authorization', `Bearer ${token}`)
      .send({ status: 'atendido' });

    expect(res.status).toBe(200);
    expect(res.body.booking.status).toBe('atendido');
  });

  it('rejeita um status invalido', async () => {
    const res = await request(app)
      .patch(`/api/bookings/${bookingId}/status`)
      .set('Authorization', `Bearer ${token}`)
      .send({ status: 'inventado' });

    expect(res.status).toBe(400);
  });

  it('GET /api/reports/summary reflete o faturamento do agendamento atendido', async () => {
    const res = await request(app).get('/api/reports/summary').set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.totalRevenue).toBeGreaterThanOrEqual(55);
    expect(res.body.byService.some((s) => s.id === 'corte-classico')).toBe(true);
    expect(res.body.byBarber.some((b) => b.id === 'rafael')).toBe(true);
  });
});
