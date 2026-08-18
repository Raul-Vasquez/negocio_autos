import { Usuario } from '../../domain/entities/Usuario';
import { login as loginApi } from '../datasources/AuthApiDatasource';

class AuthRepositoryImpl {
  async login(usuario, contrasena) {
    try {
      const response = await loginApi(usuario, contrasena);

      if (response && response.success) {
        // Mapeamos los datos reales devueltos por MySQL/Backend
        const data = response.usuario || response.data || response;

        const usuarioEntity = new Usuario(
          data.usuario || usuario,
          data.nombres || data.nombre || '',
          data.apellidos || data.apellido || '',
          data.rol || data.nombre_rol || data.rol_id || 'GERENCIA'
        );

        return {
          success: true,
          usuario: usuarioEntity,
        };
      } else {
        return {
          success: false,
          message: response.message || response.error || 'Credenciales incorrectas',
        };
      }
    } catch (error) {
      return {
        success: false,
        message: 'Error de conexión con el servidor',
      };
    }
  }
}

export default AuthRepositoryImpl;