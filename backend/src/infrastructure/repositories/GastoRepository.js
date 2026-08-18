const pool = require('../database/connection');

class GastoRepository {
  async guardar(gasto) {
    const query = `
      INSERT INTO gastos (placa, tipo_gasto, registrado_por, valor, descripcion, fecha_gasto)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    const [resultado] = await pool.query(query, [
      gasto.placa,
      gasto.tipo_gasto,
      gasto.registrado_por,
      gasto.valor,
      gasto.descripcion,
      gasto.fecha_gasto,
    ]);
    return resultado;
  }

  async obtenerPorPlaca(placa) {
    const query = `
      SELECT 
        id, placa, 
        tipo_gasto AS tipoGasto, 
        registrado_por AS registradoPor, 
        valor, descripcion, 
        DATE_FORMAT(fecha_gasto, '%d/%m/%Y') AS fechaGasto
      FROM gastos
      WHERE placa = ?
      ORDER BY id DESC
    `;
    const [filas] = await pool.query(query, [placa]);
    return filas;
  }
}

module.exports = new GastoRepository();