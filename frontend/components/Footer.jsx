const HOURS = [
  { day: 'Segunda a sexta', time: '09:00 - 20:00' },
  { day: 'Sabado', time: '09:00 - 18:00' },
  { day: 'Domingo', time: 'Fechado' },
];

const SOCIAL_LINKS = [
  { label: 'Instagram', href: 'https://instagram.com' },
  { label: 'WhatsApp', href: 'https://wa.me/5511999999999' },
  { label: 'Google Maps', href: 'https://maps.google.com' },
];

export default function Footer() {
  return (
    <footer id="contato" className="bg-void border-t border-white/5">
      <div className="mx-auto max-w-7xl px-6 md:px-10 py-20 grid md:grid-cols-[1.2fr_1fr_1fr] gap-12">
        <div>
          <h3 className="font-display text-2xl text-bone">
            Blackline<span className="text-cyan">.</span>
          </h3>
          <p className="mt-4 text-sm text-muted max-w-xs leading-relaxed">
            Rua das Tesouras, 128 · Vila Madalena, Sao Paulo - SP
          </p>

          <div className="mt-6 rounded-sm overflow-hidden border border-white/10 h-48">
            <iframe
              title="Localizacao da Blackline Barbershop"
              src="https://www.google.com/maps?q=Vila+Madalena,+Sao+Paulo&output=embed"
              className="w-full h-full grayscale contrast-125 invert-[0.92]"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>

        <div>
          <h4 className="text-sm text-bone font-medium mb-5">Horario de funcionamento</h4>
          <ul className="space-y-3">
            {HOURS.map((item) => (
              <li key={item.day} className="flex justify-between text-sm text-muted gap-6">
                <span>{item.day}</span>
                <span className="text-bone/80">{item.time}</span>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="text-sm text-bone font-medium mb-5">Redes e contato</h4>
          <ul className="space-y-3">
            {SOCIAL_LINKS.map((link) => (
              <li key={link.label}>
                <a
                  href={link.href}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm text-muted hover:text-cyan transition-colors"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>

          <h4 className="text-sm text-bone font-medium mt-8 mb-5">Politicas</h4>
          <ul className="space-y-3">
            <li>
              <a href="/politica-de-privacidade" className="text-sm text-muted hover:text-cyan transition-colors">
                Politica de privacidade
              </a>
            </li>
            <li>
              <a href="/politica-de-cancelamento" className="text-sm text-muted hover:text-cyan transition-colors">
                Politica de cancelamento
              </a>
            </li>
            <li>
              <a href="/admin/login" className="text-sm text-muted hover:text-cyan transition-colors">
                Acesso da equipe
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="laser-divider" />

      <div className="mx-auto max-w-7xl px-6 md:px-10 py-6 flex flex-col sm:flex-row justify-between gap-3 text-xs text-muted">
        <span>© {new Date().getFullYear()} Blackline Barbershop. Todos os direitos reservados.</span>
        <span>CNPJ 00.000.000/0001-00</span>
      </div>
    </footer>
  );
}
