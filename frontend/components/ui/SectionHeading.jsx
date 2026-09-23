/**
 * Cabecalho de secao reutilizavel. Deliberadamente simples: um rotulo curto
 * em caixa normal (nao all-caps) seguido de um titulo grande na fonte
 * display, mantendo consistencia tipografica sem repetir "eyebrows" genericos.
 */
export default function SectionHeading({ label, title, description, align = 'left' }) {
  const alignment = align === 'center' ? 'items-center text-center mx-auto' : 'items-start text-left';

  return (
    <div className={`flex flex-col gap-3 max-w-2xl ${alignment}`}>
      {label && (
        <span className="text-cyan text-sm font-medium tracking-wide">{label}</span>
      )}
      <h2 className="font-display text-4xl md:text-5xl font-semibold text-bone leading-[1.05]">
        {title}
      </h2>
      {description && (
        <p className="text-muted text-base md:text-lg leading-relaxed">{description}</p>
      )}
    </div>
  );
}
