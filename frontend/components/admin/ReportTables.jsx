'use client';

const priceFormatter = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

function BreakdownTable({ title, rows }) {
  return (
    <div className="bg-steel/40 border border-white/10 rounded-sm p-5">
      <h3 className="font-display text-lg text-bone mb-4">{title}</h3>
      {rows.length === 0 ? (
        <p className="text-sm text-muted">Nenhum atendimento concluido no periodo.</p>
      ) : (
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-muted border-b border-white/10">
              <th className="pb-2 font-normal">Nome</th>
              <th className="pb-2 font-normal text-right">Qtd.</th>
              <th className="pb-2 font-normal text-right">Faturamento</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className="border-b border-white/5 last:border-0">
                <td className="py-2 text-bone">{row.name || row.id}</td>
                <td className="py-2 text-right text-muted">{row.count}</td>
                <td className="py-2 text-right text-gold">{priceFormatter.format(row.revenue)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default function ReportTables({ summary }) {
  if (!summary) return null;

  return (
    <div className="grid md:grid-cols-2 gap-4">
      <BreakdownTable title="Faturamento por servico" rows={summary.byService} />
      <BreakdownTable title="Faturamento por profissional" rows={summary.byBarber} />
    </div>
  );
}
