'use client';

const priceFormatter = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

export default function SummaryCards({ summary }) {
  if (!summary) return null;

  const { totalRevenue, totalBookings, statusCounts } = summary;

  const cards = [
    { label: 'Faturamento (atendidos)', value: priceFormatter.format(totalRevenue), accent: 'text-gold' },
    { label: 'Total de agendamentos', value: totalBookings, accent: 'text-bone' },
    { label: 'Atendidos', value: statusCounts.atendido || 0, accent: 'text-cyan' },
    { label: 'Pendentes', value: statusCounts.pendente || 0, accent: 'text-bone' },
    { label: 'Cancelados / no-show', value: (statusCounts.cancelado || 0) + (statusCounts['no-show'] || 0), accent: 'text-red-300' },
  ];

  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
      {cards.map((card) => (
        <div key={card.label} className="bg-steel/40 border border-white/10 rounded-sm p-5">
          <p className="text-xs text-muted">{card.label}</p>
          <p className={`font-display text-2xl mt-2 ${card.accent}`}>{card.value}</p>
        </div>
      ))}
    </div>
  );
}
