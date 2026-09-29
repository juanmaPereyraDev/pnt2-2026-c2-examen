import AirbnbList from '@/app/components/airbnb/AirbnbList';

export const metadata = {
  title: 'Airbnb',
  description: 'Listado de propiedades de Airbnb',
};

export default function AirbnbPage() {
  return (
    <div>
      <h1>Airbnb</h1>
      <AirbnbList />
    </div>
  );
}