import Services from '@/components/Services';

export const metadata = {
  title: 'Servicos e precos',
  description: 'Conheca os servicos da Blackline Barbershop: corte, barba, pigmentacao e platinado, com preco e tempo estimado.',
};

export default function ServicosPage() {
  return (
    <main className="pt-20">
      <Services />
    </main>
  );
}
