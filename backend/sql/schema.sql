-- Extensao necessaria para o EXCLUDE constraint abaixo: permite usar "="
-- (igualdade de texto) dentro de um indice GiST combinado com um range.
-- Suportada no Neon: https://neon.com/docs/extensions/btree_gist
CREATE EXTENSION IF NOT EXISTS btree_gist;

CREATE TABLE IF NOT EXISTS bookings (
  id BIGSERIAL PRIMARY KEY,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  service_id TEXT NOT NULL,
  service_name TEXT NOT NULL,
  service_price NUMERIC(10, 2) NOT NULL,
  duration_minutes INTEGER NOT NULL,
  barber_id TEXT NOT NULL,
  barber_name TEXT NOT NULL,
  date DATE NOT NULL,
  time TIME NOT NULL,
  notes TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'pendente'
    CHECK (status IN ('pendente', 'atendido', 'cancelado', 'no-show')),
  reminder_sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Janela de tempo ocupada por este agendamento (data+hora ate data+hora+duracao).
  -- Coluna gerada automaticamente a partir de date/time/duration_minutes — nunca
  -- e escrita diretamente, so serve de base para a constraint abaixo.
  -- Usamos make_interval() (nao "duration_minutes || ' minutes'") porque colunas
  -- geradas exigem expressao IMMUTABLE, e converter numero->texto e considerado
  -- "estavel" (dependente de locale) pelo Postgres, nao imutavel.
  time_range TSRANGE GENERATED ALWAYS AS (
    tsrange(
      (date + time),
      (date + time) + make_interval(mins => duration_minutes)
    )
  ) STORED,

  -- O CORACAO da protecao contra sobrescrita: garante, dentro do proprio
  -- banco, que um barbeiro nunca tenha dois agendamentos com horario
  -- sobreposto — mesmo sob duas requisicoes simultaneas (o que a checagem em
  -- memoria da aplicacao, sozinha, nao consegue garantir). Agendamentos
  -- cancelados nao contam para essa checagem.
  EXCLUDE USING gist (
    barber_id WITH =,
    time_range WITH &&
  ) WHERE (status <> 'cancelado')
);

CREATE INDEX IF NOT EXISTS idx_bookings_date ON bookings (date);
CREATE INDEX IF NOT EXISTS idx_bookings_barber_date ON bookings (barber_id, date);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings (status);
