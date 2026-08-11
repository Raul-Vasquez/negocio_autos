const userRepository =
require('../../infrastructure/repositories/UserRepository');

class LoginUseCase {

  /*
    Valida usuario y contraseña.
  */
  async ejecutar(usuario, contrasena) {

    const usuarioEncontrado =
      await userRepository.obtenerPorUsuario(usuario);

    if (!usuarioEncontrado) {

      return {
        success: false,
        message: 'Usuario no encontrado'
      };

    }

    if (
      usuarioEncontrado.contrasena !== contrasena
    ) {

      return {
        success: false,
        message: 'Contraseña incorrecta'
      };

    }

    return {
      success: true,
      message: 'Inicio de sesión correcto',
      usuario: {
        usuario: usuarioEncontrado.usuario,
        nombres: usuarioEncontrado.nombres,
        apellidos: usuarioEncontrado.apellidos
      }
    };
  }
}

module.exports = new LoginUseCase();