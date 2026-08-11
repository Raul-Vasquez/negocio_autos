const pool = require('../database/connection');

class UserRepository {

  /*
    Busca un usuario por su nombre de usuario.
  */
  async obtenerPorUsuario(usuario) {

    const [rows] = await pool.query(
      `
      SELECT *
      FROM usuarios
      WHERE usuario = ?
      LIMIT 1
      `,
      [usuario]
    );

    return rows[0];
  }

}

module.exports = new UserRepository();