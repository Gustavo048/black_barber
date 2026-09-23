import Gallery from '@/components/Gallery';

export const metadata = {
  title: 'Galeria de cortes',
  description: 'Veja o portfolio de cortes, barbas e coloracoes realizados na Blackline Barbershop.',
};

export default function GaleriaPage() {
  return (
    <main className="pt-20">
      <Gallery />
    </main>
  );
}
