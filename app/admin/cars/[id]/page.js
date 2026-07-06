'use client';

import { use } from 'react';
import CarForm from '../CarForm';

export default function EditCar({ params }) {
  const { id } = use(params);
  return <CarForm carId={id} />;
}
