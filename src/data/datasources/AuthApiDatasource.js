import { API_BASE_URL } from '../../shared/constants/api';

export async function login(
  usuario,
  contrasena
) {

  const response = await fetch(
    `${API_BASE_URL}/api/auth/login`,
    {
      method: 'POST',

      headers: {
        'Content-Type': 'application/json'
      },

      body: JSON.stringify({
        usuario,
        contrasena
      })
    }
  );

  return response.json();

}