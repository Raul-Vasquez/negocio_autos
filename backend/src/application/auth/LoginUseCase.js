const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const userRepository = require('../../infrastructure/repositories/UserRepository');

// Clave secreta para firmar tokens (puedes cambiarla por una en tu archivo .env)
const JWT_SECRET = process.env.JWT_SECRET || 'llave_secreta_orbita_rodante_2026';

class LoginUseCase {
  async ejecutar(usuario, contrasena) {
    // 1. Validar que vengan los datos
    if (!usuario || !contrasena) {
      return { success: false, message: 'Usuario y contraseña requeridos' };
    }

    // 2. Buscar usuario en la BD
    const user = await userRepository.obtenerPorUsuario(usuario);
    if (!user) {
      return { success: false, message: 'Usuario o contraseña incorrectos' };
    }

    // 3. Verificar contraseña (soporta texto plano actual o hash encriptado de bcrypt)
    let esValida = false;

    if (user.contrasena.startsWith('$2a$') || user.contrasena.startsWith('$2b$')) {
      // Contraseña encriptada con bcrypt
      esValida = await bcrypt.compare(contrasena, user.contrasena);
    } else {
      // Contraseña en texto plano (para compatibilidad de usuarios antiguos)
      esValida = contrasena === user.contrasena;
    }

    if (!esValida) {
      return { success: false, message: 'Usuario o contraseña incorrectos' };
    }

    // 4. Generar Token JWT (Válido por 30 días para no pedir clave a cada rato)
    const token = jwt.sign(
      {
        usuario: user.usuario,
        nombres: user.nombres,
        rol: user.rol,
      },
      JWT_SECRET,
      { expiresIn: '30d' }
    );

    // 5. Retornar datos y token al frontend
    return {
      success: true,
      message: 'Inicio de sesión exitoso',
      token,
      usuario: {
        usuario: user.usuario,
        nombres: user.nombres,
        apellidos: user.apellidos,
        rol: user.rol,
      },
    };
  }
}

module.exports = new LoginUseCase();