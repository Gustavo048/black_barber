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

describe('POST /api/bookings', () => {
  const app = buildApp();
  const futureDate = nextWeekday(3); // quarta-feira: sempre aberta, 09:00-20:00

  it('cria um agendamento valido e retorna 201', async () => {
    const res = await request(app).post('/api/bookings').send({
      customerName: 'Joao Silva',
      customerPhone: '5511999999999',
      serviceId: 'corte-classico',
      barberId: 'rafael',
      date: futureDate,
      time: '15:00',
    });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.booking.status).toBe('pendente');
    expect(res.body.booking.barberId).toBe('rafael');
  });

  it('rejeita servico inexistente com 400', async () => {
    const res = await request(app).post('/api/bookings').send({
      customerName: 'Joao Silva',
      customerPhone: '5511999999999',
      serviceId: 'servico-inexistente',
      date: futureDate,
      time: '15:00',
    });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('rejeita telefone invalido com 400', async () => {
    const res = await request(app).post('/api/bookings').send({
      customerName: 'Joao Silva',
      customerPhone: '123',
      serviceId: 'corte-classico',
      date: futureDate,
      time: '15:00',
    });

    expect(res.status).toBe(400);
  });

  it('rejeita horario fora do expediente (fechamento as 20:00, pedindo as 21:00)', async () => {
    const res = await request(app).post('/api/bookings').send({
      customerName: 'Joao Silva',
      customerPhone: '5511999999998',
      serviceId: 'corte-classico',
      date: futureDate,
      time: '21:00',
    });

    expect(res.status).toBe(400);
  });
});

describe('GET /api/services', () => {
  it('retorna a lista de servicos', async () => {
    const app = buildApp();
    const res = await request(app).get('/api/services');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.services)).toBe(true);
    expect(res.body.services.length).toBeGreaterThan(0);
  });
});
