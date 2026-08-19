import { useLocalSearchParams } from 'expo-router';
import React from 'react';
import DetalleVehiculoScreen from '../src/presentation/screens/DetalleVehiculoScreen';

export default function DetalleVehiculoRoute() {
  const { placa } = useLocalSearchParams<{ placa: string }>();

  return <DetalleVehiculoScreen placa={placa || ''} />;
}