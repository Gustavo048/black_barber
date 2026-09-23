'use client';

const STATUS_OPTIONS = [
  { value: '', label: 'Todos os status' },
  { value: 'pendente', label: 'Pendente' },
  { value: 'atendido', label: 'Atendido' },
  { value: 'cancelado', label: 'Cancelado' },
  { value: 'no-show', label: 'Nao compareceu' },
];

export default function FiltersBar({ filters, onChange, services, barbers }) {
  function update(field) {
    return (e) => onChange({ ...filters, [field]: e.target.value });
  }

  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4 bg-steel/40 border border-white/10 rounded-sm p-5">
      <Field label="De">
        <input type="date" value={filters.startDate} onChange={update('startDate')} className="input" />
      </Field>
      <Field label="Ate">
        <input type="date" value={filters.endDate} onChange={update('endDate')} className="input" />
      </Field>
      <Field label="Profissional">
        <select value={filters.barberId} onChange={update('barberId')} className="input">
          <option value="">Todos</option>
          {barbers.map((b) => (
            <option key={b.id} value={b.id}>
              {b.name}
            </option>
          ))}
        </select>
      </Field>
      <Field label="Servico">
        <select value={filters.serviceId} onChange={update('serviceId')} className="input">
          <option value="">Todos</option>
          {services.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
      </Field>
      <Field label="Status">
        <select value={filters.status} onChange={update('status')} className="input">
          {STATUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </Field>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-xs text-muted">{label}</span>
      {children}
    </div>
  );
}
