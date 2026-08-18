const express = require('express');
const cors = require('cors');

// 1. Importación de rutas (Capa de Presentación)
const authRoutes = require('./presentation/routes/authRoutes');
const gastoRoutes = require('./presentation/routes/gastoRoutes');

// 2. Conexión a la Base de Datos MySQL (Capa de Infraestructura)
const pool = require('./infrastructure/database/connection');

const app = express();

// Configuración de permisos y lectura de JSON
app.use(cors());
app.use(express.json());

// Ruta de prueba para comprobar que la API funciona
app.get('/api/health', (req, res) => {
  res.status(200).json({
    mensaje: 'API Órbita Rodante operativa'
  });
});

// 3. Registro de rutas modulares (Arquitectura Limpia)
app.use('/api/auth', authRoutes);
app.use('/api/gastos', gastoRoutes);

// ==========================================
// CONSULTAR TODOS LOS VEHÍCULOS
// ==========================================
app.get('/api/vehiculos', async (req, res) => {
  try {
    const query = `
      SELECT 
        v.placa, v.marca, v.modelo, v.anio, v.color, v.combustible,
        v.fecha_compra AS fechaCompra, v.precio_compra AS precioCompra,
        v.numero_traspasos AS numeroTraspasos, v.sri, v.coopaire, v.ant,
        v.total_adeudado AS totalAdeudado, v.motor,
        v.estetica_exterior AS esteticaExterior, v.estetica_interior AS esteticaInterior,
        v.observaciones, v.foto_principal AS fotoPrincipal,
        d.cedula AS cedulaDueno, d.nombres AS nombreDueno, d.telefono AS telefonoDueno,
        a.aporte_raul AS aporteRaul, a.aporte_hector AS aporteHector
      FROM vehiculos v
      LEFT JOIN duenos d ON v.cedula_dueno = d.cedula
      LEFT JOIN aportes_socios a ON v.placa = a.placa
    `;

    const [filas] = await pool.query(query);
    res.status(200).json(filas);
  } catch (error) {
    console.error('Error al obtener vehículos:', error);
    res.status(500).json({ error: 'Error al consultar la base de datos' });
  }
});

// ==========================================
// REGISTRAR VEHÍCULO DE FORMA PERSISTENTE
// ==========================================
app.post('/api/vehiculos', async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const data = req.body;

    // 1. Guardar/Actualizar Dueño
    if (data.cedulaDueno) {
      await connection.query(
        `INSERT INTO duenos (cedula, nombres, telefono) 
         VALUES (?, ?, ?) 
         ON DUPLICATE KEY UPDATE nombres = VALUES(nombres), telefono = VALUES(telefono)`,
        [data.cedulaDueno, data.nombreDueno || '', data.telefonoDueno || '']
      );
    }

    // 2. Formatear Fecha (DD/MM/YYYY a YYYY-MM-DD)
    let fechaFormateada = null;
    if (data.fechaCompra && data.fechaCompra.includes('/')) {
      const [dia, mes, anio] = data.fechaCompra.split('/');
      fechaFormateada = `${anio}-${mes}-${dia}`;
    }

    // 3. Guardar Vehículo
    const sqlVehiculo = `
      INSERT INTO vehiculos (
        placa, marca, modelo, anio, color, combustible,
        fecha_compra, precio_compra, numero_traspasos, sri, coopaire, ant,
        total_adeudado, motor, estetica_exterior, estetica_interior,
        observaciones, foto_principal, cedula_dueno
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    await connection.query(sqlVehiculo, [
      data.placa, data.marca, data.modelo, data.anio, data.color, data.combustible,
      fechaFormateada, data.precioCompra, data.numeroTraspasos, data.sri, data.coopaire, data.ant,
      data.totalAdeudado, data.motor, data.esteticaExterior, data.esteticaInterior,
      data.observaciones, data.fotoPrincipal, data.cedulaDueno
    ]);

    // 4. Guardar Aportes de Socios
    const sqlAportes = `
      INSERT INTO aportes_socios (placa, aporte_raul, aporte_hector)
      VALUES (?, ?, ?)
    `;

    await connection.query(sqlAportes, [
      data.placa,
      data.aporteRaul || 0,
      data.aporteHector || 0
    ]);

    await connection.commit();
    console.log('✅ Vehículo guardado permanentemente en MySQL:', data.placa);

    res.status(201).json({ mensaje: 'Vehículo registrado con éxito' });
  } catch (error) {
    await connection.rollback();
    console.error('Error al guardar en BD:', error);
    res.status(500).json({ error: 'Error al registrar en la base de datos' });
  } finally {
    connection.release();
  }
});

// 4. Arrancar Servidor
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`✅ Servidor ejecutándose en puerto ${PORT}`);
});