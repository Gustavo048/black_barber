import BookingForm from '@/components/BookingForm';

export const metadata = {
  title: 'Agendar horario',
  description: 'Agende seu horario na Blackline Barbershop e receba a confirmacao na hora pelo WhatsApp.',
};

export default function AgendarPage() {
  return (
    <main className="pt-20">
      <BookingForm />
    </main>
  );
}
