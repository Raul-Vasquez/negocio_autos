import { API_BASE_URL } from '../../shared/constants/api';

export async function obtenerVehiculosApi() {
  const response = await fetch(`${API_BASE_URL}/api/vehiculos`);
  if (!response.ok) {
    throw new Error(`Error en el servidor: ${response.status}`);
  }
  return response.json();
}

export async function crearVehiculoApi(datosVehiculo) {
  const response = await fetch(`${API_BASE_URL}/api/vehiculos`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(datosVehiculo),
  });
  if (!response.ok) {
    throw new Error(`Error en el servidor: ${response.status}`);
  }
  return response.json();
}