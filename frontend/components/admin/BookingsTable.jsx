'use client';

import { useState } from 'react';

const priceFormatter = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

const STATUS_STYLES = {
  pendente: 'text-bone border-white/20',
  atendido: 'text-cyan border-cyan/40',
  cancelado: 'text-red-300 border-red-500/30',
  'no-show': 'text-gold border-gold/30',
};

const STATUS_LABELS = {
  pendente: 'Pendente',
  atendido: 'Atendido',
  cancelado: 'Cancelado',
  'no-show': 'Nao compareceu',
};

const ACTIONS = [
  { status: 'atendido', label: 'Atendido' },
  { status: 'cancelado', label: 'Cancelar' },
  { status: 'no-show', label: 'Nao compareceu' },
];

export default function BookingsTable({ bookings, onChangeStatus }) {
  const [updatingId, setUpdatingId] = useState(null);

  async function handleAction(booking, status) {
    setUpdatingId(booking.id);
    try {
      await onChangeStatus(booking.id, status);
    } finally {
      setUpdatingId(null);
    }
  }

  if (bookings.length === 0) {
    return (
      <div className="bg-steel/40 border border-white/10 rounded-sm p-8 text-center text-sm text-muted">
        Nenhum agendamento encontrado para esses filtros.
      </div>
    );
  }

  return (
    <div className="bg-steel/40 border border-white/10 rounded-sm overflow-x-auto">
      <table className="w-full text-sm min-w-[880px]">
        <thead>
          <tr className="text-left text-muted border-b border-white/10">
            <th className="p-4 font-normal">Data / Hora</th>
            <th className="p-4 font-normal">Cliente</th>
            <th className="p-4 font-normal">Servico</th>
            <th className="p-4 font-normal">Profissional</th>
            <th className="p-4 font-normal text-right">Valor</th>
            <th className="p-4 font-normal">Status</th>
            <th className="p-4 font-normal">Acoes</th>
          </tr>
        </thead>
        <tbody>
          {bookings.map((booking) => (
            <tr key={booking.id} className="border-b border-white/5 last:border-0 align-top">
              <td className="p-4 text-bone whitespace-nowrap">
                {booking.date} · {booking.time}
              </td>
              <td className="p-4">
                <p className="text-bone">{booking.customerName}</p>
                <p className="text-xs text-muted">{booking.customerPhone}</p>
                {booking.notes && <p className="text-xs text-muted/70 mt-1 max-w-[180px]">{booking.notes}</p>}
              </td>
              <td className="p-4 text-muted">{booking.serviceName}</td>
              <td className="p-4 text-muted">{booking.barberName}</td>
              <td className="p-4 text-right text-gold whitespace-nowrap">
                {priceFormatter.format(booking.servicePrice || 0)}
              </td>
              <td className="p-4">
                <span className={`inline-block text-xs border rounded-sm px-2 py-1 ${STATUS_STYLES[booking.status]}`}>
                  {STATUS_LABELS[booking.status] || booking.status}
                </span>
              </td>
              <td className="p-4">
                <div className="flex flex-col gap-1">
                  {ACTIONS.filter((a) => a.status !== booking.status).map((action) => (
                    <button
                      key={action.status}
                      type="button"
                      disabled={updatingId === booking.id}
                      onClick={() => handleAction(booking, action.status)}
                      className="text-xs text-muted hover:text-cyan transition-colors text-left disabled:opacity-40"
                    >
                      Marcar {action.label.toLowerCase()}
                    </button>
                  ))}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
