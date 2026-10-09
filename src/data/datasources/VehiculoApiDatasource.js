import { API_BASE_URL } from '../../shared/constants/api';

const validarApiBase = () => {
  if (!API_BASE_URL) {
    throw new Error('No se configuró EXPO_PUBLIC_API_URL en el entorno.');
  }
};

const crearFormDataVehiculo = (datosVehiculo) => {
  const formData = new FormData();

  Object.entries(datosVehiculo).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') {
      return;
    }

    if (key === 'foto' && typeof value === 'object' && value.uri) {
      formData.append('foto', {
        uri: value.uri,
        name: value.name || 'vehiculo.jpg',
        type: value.type || 'image/jpeg',
      });
      return;
    }

    formData.append(key, String(value));
  });

  return formData;
};

export async function obtenerVehiculosApi() {
  validarApiBase();
  const response = await fetch(`${API_BASE_URL}/api/vehiculos`);
  if (!response.ok) {
    throw new Error(`Error en el servidor: ${response.status}`);
  }
  return response.json();
}

export async function obtenerVehiculosVendidosApi() {
  validarApiBase();
  const response = await fetch(`${API_BASE_URL}/api/vehiculos/vendidos`);
  if (!response.ok) {
    throw new Error(`Error en el servidor: ${response.status}`);
  }
  return response.json();
}

export async function crearVehiculoApi(datosVehiculo) {
  validarApiBase();

  const tieneFoto = datosVehiculo?.foto && typeof datosVehiculo.foto === 'object' && datosVehiculo.foto.uri;
  const formData = crearFormDataVehiculo(datosVehiculo);

  const response = await fetch(`${API_BASE_URL}/api/vehiculos`, {
    method: 'POST',
    body: formData,
    headers: tieneFoto ? {} : undefined,
  });

  if (!response.ok) {
    throw new Error(`Error en el servidor: ${response.status}`);
  }
  return response.json();
}

export async function registrarVentaApi(venta) {
  validarApiBase();

  const response = await fetch(`${API_BASE_URL}/api/vehiculos/vender`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(venta),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Error en el servidor: ${response.status}`);
  }

  return response.json();
}