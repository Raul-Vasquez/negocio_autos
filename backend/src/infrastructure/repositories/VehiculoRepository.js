const pool = require('../database/connection');

class VehiculoRepository {
  async obtenerPorPlaca(placa) {
    const query = `
      SELECT 
        v.placa,
        v.marca,
        v.modelo,
        v.anio,
        v.color,
        v.combustible,
        v.precio_compra AS precioCompra,
        v.foto_principal AS fotoUrl,
        v.cedula_dueno AS cedulaPropietario,
        d.nombres AS propietarioAnterior,
        d.telefono AS telefonoPropietario
      FROM vehiculos v
      LEFT JOIN duenos d ON v.cedula_dueno = d.cedula
      WHERE v.placa = ?
    `;
    const [filas] = await pool.query(query, [placa]);
    
    // ESTO IMPRIMIRÁ EN TU TERMINAL LO QUE ENCUENTRA LA BASE DE DATOS:
    console.log('DATOS ENCONTRADOS:', filas[0]);

    return filas[0] || null;
  }
}

module.exports = VehiculoRepository;