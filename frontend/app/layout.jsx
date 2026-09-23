import { Oswald, Inter } from 'next/font/google';
import './globals.css';

const oswald = Oswald({
  subsets: ['latin'],
  weight: ['500', '600', '700'],
  variable: '--font-display',
});

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-body',
});

export const metadata = {
  title: {
    default: 'Blackline Barbershop | Corte e barba de precisao',
    template: '%s | Blackline Barbershop',
  },
  description:
    'Agende online na Blackline Barbershop: cortes, barba e coloracao com tecnica de precisao e confirmacao instantanea pelo WhatsApp.',
  openGraph: {
    title: 'Blackline Barbershop',
    description: 'Corte e barba de precisao. Agende em segundos, confirme pelo WhatsApp.',
    type: 'website',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR" className={`${oswald.variable} ${inter.variable}`}>
      <body className="font-body antialiased bg-void">{children}</body>
    </html>
  );
}

