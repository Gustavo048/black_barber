'use client';

import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createBooking, fetchAvailability, fetchBarbers, fetchServices } from '@/lib/api';
import { SERVICES as FALLBACK_SERVICES } from '@/data/services';
import { BARBERS as FALLBACK_BARBERS } from '@/data/barbers';
import SectionHeading from '@/components/ui/SectionHeading';
import Calendar from '@/components/Calendar';

const INITIAL_AVAILABILITY = { loading: false, open: null, slots: [] };
const INITIAL_CONTACT = { customerName: '', customerPhone: '', notes: '' };

const dateFormatter = new Intl.DateTimeFormat('pt-BR', {
  weekday: 'long',
  day: '2-digit',
  month: 'long',
});

/** Normaliza o telefone digitado (mascara, espacos, "+") para o formato E.164 sem "+". */
function normalizePhone(rawPhone) {
  return rawPhone.replace(/\D/g, '');
}

function formatDateLabel(iso) {
  if (!iso) return '';
  const [year, month, day] = iso.split('-').map(Number);
  const label = dateFormatter.format(new Date(year, month - 1, day));
  return label.charAt(0).toUpperCase() + label.slice(1);
}

/**
 * Fluxo em 3 passos: (1) escolher servico/profissional e um dia no
 * calendario, (2) escolher um horario livre naquele dia, (3) preencher os
 * dados de contato e confirmar. O cliente nunca digita um horario "no
 * escuro" — so ve o que a API confirma como disponivel.
 */
export default function BookingForm() {
  const [services, setServices] = useState(FALLBACK_SERVICES);
  const [barbers, setBarbers] = useState(FALLBACK_BARBERS);

  const [serviceId, setServiceId] = useState('');
  const [barberId, setBarberId] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [contact, setContact] = useState(INITIAL_CONTACT);

  const [availability, setAvailability] = useState(INITIAL_AVAILABILITY);
  const [step, setStep] = useState('browse'); // browse | details | success
  const [status, setStatus] = useState('idle'); // idle | submitting | error
  const [feedback, setFeedback] = useState(null);

  useEffect(() => {
    fetchServices().then((d) => d.services?.length && setServices(d.services)).catch(() => {});
    fetchBarbers().then((d) => d.barbers?.length && setBarbers(d.barbers)).catch(() => {});
  }, []);

  // Busca horarios livres sempre que servico, data ou barbeiro preferido mudam.
  useEffect(() => {
    if (!date || !serviceId) {
      setAvailability(INITIAL_AVAILABILITY);
      return;
    }

    let cancelled = false;
    setAvailability((prev) => ({ ...prev, loading: true }));

    fetchAvailability({ date, serviceId, barberId: barberId || undefined })
      .then((data) => {
        if (cancelled) return;
        setAvailability({ loading: false, open: data.open, slots: data.slots || [] });
      })
      .catch(() => {
        if (cancelled) return;
        setAvailability({ loading: false, open: null, slots: [] });
      });

    return () => {
      cancelled = true;
    };
  }, [date, serviceId, barberId]);

  const selectedService = useMemo(() => services.find((s) => s.id === serviceId) || null, [services, serviceId]);
  const selectedBarber = useMemo(() => barbers.find((b) => b.id === barberId) || null, [barbers, barberId]);

  function handleSelectDate(iso) {
    setDate(iso);
    setTime('');
  }

  function handleSelectSlot(slotTime) {
    setTime(slotTime);
    setStep('details');
  }

  function handleBackToSlots() {
    setStep('browse');
    setStatus('idle');
    setFeedback(null);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus('submitting');
    setFeedback(null);

    try {
      const response = await createBooking({
        customerName: contact.customerName,
        customerPhone: normalizePhone(contact.customerPhone),
        notes: contact.notes,
        serviceId,
        barberId: barberId || undefined,
        date,
        time,
      });
      setFeedback(response);
      setStep('success');
    } catch (error) {
      setStatus('error');
      setFeedback({ message: error.message });
    }
  }

  function handleRestart() {
    setServiceId('');
    setBarberId('');
    setDate('');
    setTime('');
    setContact(INITIAL_CONTACT);
    setAvailability(INITIAL_AVAILABILITY);
    setStep('browse');
    setStatus('idle');
    setFeedback(null);
  }

  const canBrowseCalendar = Boolean(serviceId);

  return (
    <section id="agendar" className="bg-steel/40 py-24 md:py-32 border-y border-white/5">
      <div className="mx-auto max-w-7xl px-6 md:px-10 grid lg:grid-cols-[1fr_1.1fr] gap-16 items-start">
        <div className="lg:sticky lg:top-28">
          <SectionHeading
            label="Agendamento"
            title="Escolha o dia e o horario."
            description="Selecione o servico, veja no calendario os dias disponiveis e escolha um horario livre. Ao confirmar, voce recebe a confirmacao no WhatsApp e a barbearia e avisada na hora sobre o novo agendamento."
          />

          <div className="mt-10 flex items-start gap-4 rounded-sm border border-white/10 p-5">
            <div className="mt-1 h-2 w-2 rounded-full bg-cyan shrink-0" />
            <p className="text-sm text-muted leading-relaxed">
              Os horarios exibidos ja descontam a duracao do servico e os agendamentos
              existentes — o que aparece na lista esta garantidamente livre no momento da consulta.
            </p>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.5 }}
          className="bg-void border border-white/10 rounded-sm p-6 md:p-8"
        >
          <AnimatePresence mode="wait">
            {step === 'browse' && (
              <motion.div
                key="browse"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="space-y-8"
              >
                <div className="grid sm:grid-cols-2 gap-6">
                  <Field label="Servico" htmlFor="serviceId">
                    <select
                      id="serviceId"
                      value={serviceId}
                      onChange={(e) => {
                        setServiceId(e.target.value);
                        setTime('');
                      }}
                      className="input"
                    >
                      <option value="" disabled>
                        Selecione um servico
                      </option>
                      {services.map((service) => (
                        <option key={service.id} value={service.id}>
                          {service.name} · {service.durationMinutes}min
                        </option>
                      ))}
                    </select>
                  </Field>

                  <Field label="Profissional (opcional)" htmlFor="barberId">
                    <select
                      id="barberId"
                      value={barberId}
                      onChange={(e) => {
                        setBarberId(e.target.value);
                        setTime('');
                      }}
                      className="input"
                    >
                      <option value="">Sem preferencia</option>
                      {barbers.map((barber) => (
                        <option key={barber.id} value={barber.id}>
                          {barber.name}
                        </option>
                      ))}
                    </select>
                  </Field>
                </div>

                <div>
                  {!canBrowseCalendar && (
                    <p className="text-sm text-muted/80 mb-3">Selecione um servico para ver os dias disponiveis.</p>
                  )}
                  <Calendar selectedDate={date} onSelectDate={handleSelectDate} disabled={!canBrowseCalendar} />
                </div>

                {date && canBrowseCalendar && (
                  <div className="border-t border-white/10 pt-6">
                    <p className="text-sm text-bone mb-4">
                      Horarios livres em <span className="text-cyan">{formatDateLabel(date)}</span>
                      {selectedBarber ? ` com ${selectedBarber.name}` : ''}
                    </p>

                    {availability.loading ? (
                      <p className="text-sm text-muted/80">Consultando horarios livres...</p>
                    ) : availability.open === false ? (
                      <p className="text-sm text-gold/90">A barbearia esta fechada nesse dia. Escolha outra data.</p>
                    ) : availability.slots.length === 0 ? (
                      <p className="text-sm text-gold/90">
                        Nenhum horario livre nesse dia{selectedBarber ? ' com esse profissional' : ''}. Tente outra
                        data{selectedBarber ? ' ou outro profissional' : ''}.
                      </p>
                    ) : (
                      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                        {availability.slots.map((slot) => (
                          <button
                            key={slot.time}
                            type="button"
                            onClick={() => handleSelectSlot(slot.time)}
                            title={slot.availableBarbers.map((b) => b.name).join(', ')}
                            className="group flex flex-col items-center gap-0.5 py-2.5 rounded-sm border border-white/10 hover:border-cyan hover:bg-cyan/5 transition-colors"
                          >
                            <span className="text-sm text-bone group-hover:text-cyan transition-colors">
                              {slot.time}
                            </span>
                            {!selectedBarber && (
                              <span className="text-[11px] text-muted">
                                {slot.availableBarbers.length}{' '}
                                {slot.availableBarbers.length === 1 ? 'profissional' : 'profissionais'}
                              </span>
                            )}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            )}

            {step === 'details' && (
              <motion.form
                key="details"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
                onSubmit={handleSubmit}
                className="space-y-6"
              >
                <button
                  type="button"
                  onClick={handleBackToSlots}
                  className="text-sm text-muted hover:text-cyan transition-colors"
                >
                  ‹ Trocar horario
                </button>

                <div className="rounded-sm border border-cyan/30 bg-cyan/5 p-4 text-sm text-bone space-y-1">
                  <p className="font-medium">{selectedService?.name}</p>
                  <p className="text-muted">
                    {formatDateLabel(date)} as {time}
                    {selectedBarber ? ` · ${selectedBarber.name}` : ' · profissional a definir na confirmacao'}
                  </p>
                </div>

                <div className="grid sm:grid-cols-2 gap-6">
                  <Field label="Nome completo" htmlFor="customerName">
                    <input
                      id="customerName"
                      required
                      minLength={2}
                      value={contact.customerName}
                      onChange={(e) => setContact((prev) => ({ ...prev, customerName: e.target.value }))}
                      placeholder="Seu nome"
                      className="input"
                    />
                  </Field>

                  <Field label="WhatsApp" htmlFor="customerPhone">
                    <input
                      id="customerPhone"
                      required
                      value={contact.customerPhone}
                      onChange={(e) => setContact((prev) => ({ ...prev, customerPhone: e.target.value }))}
                      placeholder="(11) 99999-9999"
                      className="input"
                    />
                  </Field>
                </div>

                <Field label="Observacoes (opcional)" htmlFor="notes">
                  <textarea
                    id="notes"
                    rows={3}
                    value={contact.notes}
                    onChange={(e) => setContact((prev) => ({ ...prev, notes: e.target.value }))}
                    placeholder="Alguma preferencia de estilo ou restricao?"
                    className="input resize-none"
                  />
                </Field>

                <button
                  type="submit"
                  disabled={status === 'submitting'}
                  className="w-full inline-flex justify-center rounded-sm bg-cyan text-void font-semibold py-3.5 shadow-glowCyan hover:brightness-110 transition disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {status === 'submitting' ? 'Enviando...' : 'Confirmar agendamento'}
                </button>

                {status === 'error' && feedback && (
                  <div className="rounded-sm border border-red-500/30 bg-red-500/5 p-4 text-sm text-red-300">
                    {feedback.message}
                  </div>
                )}
              </motion.form>
            )}

            {step === 'success' && feedback && (
              <motion.div
                key="success"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="space-y-6 text-center py-6"
              >
                <div className="mx-auto h-12 w-12 rounded-full border border-cyan flex items-center justify-center text-cyan text-xl">
                  ✓
                </div>
                <div>
                  <h3 className="font-display text-xl text-bone">Agendamento confirmado</h3>
                  <p className="mt-2 text-sm text-muted leading-relaxed max-w-sm mx-auto">{feedback.message}</p>
                  <p className="mt-2 text-xs text-muted/70">A barbearia ja foi avisada do seu horario.</p>
                </div>

                {feedback.whatsappFallbackUrl && (
                  <a
                    href={feedback.whatsappFallbackUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-block text-cyan underline underline-offset-4 text-sm"
                  >
                    Confirmar pelo WhatsApp
                  </a>
                )}

                <div>
                  <button
                    type="button"
                    onClick={handleRestart}
                    className="text-sm text-muted hover:text-cyan transition-colors"
                  >
                    Agendar outro horario
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  );
}

function Field({ label, htmlFor, children }) {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={htmlFor} className="text-sm text-muted">
        {label}
      </label>
      {children}
    </div>
  );
}
