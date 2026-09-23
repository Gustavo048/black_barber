import Barbers from '@/components/Barbers';

export const metadata = {
  title: 'Nossa equipe',
  description: 'Conheca os barbeiros da Blackline Barbershop e suas especialidades.',
};

export default function EquipePage() {
  return (
    <main className="pt-20">
      <Barbers />
    </main>
  );
}
