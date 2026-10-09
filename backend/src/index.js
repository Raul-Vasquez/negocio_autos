const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// 1. Importación de rutas (Capa de Presentación)
const authRoutes = require('./presentation/routes/authRoutes');
const gastoRoutes = require('./presentation/routes/gastoRoutes');

// 2. Conexión a la Base de Datos MySQL (Capa de Infraestructura)
const pool = require('./infrastructure/database/connection');

const app = express();

process.on('uncaughtException', (error) => {
  console.error('❌ uncaughtException del backend:', error);
});

process.on('unhandledRejection', (reason) => {
  console.error('❌ unhandledRejection del backend:', reason);
});

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CARPETA PÚBLICA PARA SERVIR IMÁGENES
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
app.use('/uploads', express.static(uploadsDir));

// CONFIGURACIÓN DE MULTER
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname) || '.jpg';
    cb(null, `vehiculo-${Date.now()}${ext}`);
  },
});
const upload = multer({ storage });

// Ruta de prueba
app.get('/api/health', (req, res) => {
  res.status(200).json({ mensaje: 'API Órbita Rodante operativa' });
});

// Rutas modulares
app.use('/api/auth', authRoutes);
app.use('/api/gastos', gastoRoutes);

// CONSULTAR TODOS LOS VEHÍCULOS DISPONIBLES (DEVUELVE DD/MM/YYYY)
app.get('/api/vehiculos', async (req, res) => {
  try {
    const query = `
      SELECT 
        v.placa, v.marca, v.modelo, v.tipo_vehiculo AS tipoVehiculo, v.anio, v.color, v.combustible,
        DATE_FORMAT(v.fecha_compra, '%d/%m/%Y') AS fechaCompra, 
        v.precio_compra AS precioCompra,
        v.numero_traspasos AS numeroTraspasos, v.sri, v.coopaire, v.ant,
        v.total_adeudado AS totalAdeudado, v.motor,
        v.estetica_exterior AS esteticaExterior, v.estetica_interior AS esteticaInterior,
        v.observaciones, v.foto_principal AS fotoPrincipal,
        v.estado,
        d.cedula AS cedulaDueno, d.nombres AS nombreDueno, d.telefono AS telefonoDueno,
        a.aporte_raul AS aporteRaul, a.aporte_hector AS aporteHector
      FROM vehiculos v
      LEFT JOIN duenos d ON v.cedula_dueno = d.cedula
      LEFT JOIN aportes_socios a ON v.placa = a.placa
      WHERE v.estado IS NULL OR v.estado = 'DISPONIBLE' OR v.estado <> 'VENDIDO'
      ORDER BY v.marca ASC, v.modelo ASC
    `;
    const [filas] = await pool.query(query);
    res.status(200).json(filas);
  } catch (error) {
    console.error('Error al obtener vehículos:', error);
    res.status(500).json({ error: 'Error al consultar la base de datos' });
  }
});

// CONSULTAR VEHÍCULOS VENDIDOS (HISTÓRICO Y LIQUIDACIONES)
app.get('/api/vehiculos/vendidos', async (req, res) => {
  try {
    const query = `
      SELECT 
        v.placa, v.marca, v.modelo, v.tipo_vehiculo AS tipoVehiculo, v.anio, v.color, v.combustible,
        DATE_FORMAT(v.fecha_compra, '%d/%m/%Y') AS fechaCompra,
        DATE_FORMAT(v.fecha_venta, '%d/%m/%Y') AS fechaVenta,
        v.precio_compra AS precioCompra,
        v.precio_venta AS precioVenta,
        v.estado,
        v.ganancia_neta AS gananciaNeta,
        v.liquidacion_raul AS liquidacionRaul,
        v.liquidacion_hector AS liquidacionHector,
        COALESCE((SELECT SUM(valor) FROM gastos WHERE placa = v.placa), 0) AS totalGastos,
        (COALESCE((SELECT SUM(valor) FROM gastos WHERE placa = v.placa), 0) / 2) AS gastosRaul,
        (COALESCE((SELECT SUM(valor) FROM gastos WHERE placa = v.placa), 0) / 2) AS gastosHector,
        ((v.precio_venta - (a.aporte_raul + a.aporte_hector + COALESCE((SELECT SUM(valor) FROM gastos WHERE placa = v.placa), 0))) / 2) AS gananciaRaul,
        ((v.precio_venta - (a.aporte_raul + a.aporte_hector + COALESCE((SELECT SUM(valor) FROM gastos WHERE placa = v.placa), 0))) / 2) AS gananciaHector,
        (a.aporte_raul + (COALESCE((SELECT SUM(valor) FROM gastos WHERE placa = v.placa), 0) / 2) + ((v.precio_venta - (a.aporte_raul + a.aporte_hector + COALESCE((SELECT SUM(valor) FROM gastos WHERE placa = v.placa), 0))) / 2)) AS totalRaul,
        (a.aporte_hector + (COALESCE((SELECT SUM(valor) FROM gastos WHERE placa = v.placa), 0) / 2) + ((v.precio_venta - (a.aporte_raul + a.aporte_hector + COALESCE((SELECT SUM(valor) FROM gastos WHERE placa = v.placa), 0))) / 2)) AS totalHector,
        v.foto_principal AS fotoPrincipal,
        a.aporte_raul AS aporteRaul,
        a.aporte_hector AS aporteHector
      FROM vehiculos v
      LEFT JOIN aportes_socios a ON a.placa = v.placa
      WHERE v.estado = 'VENDIDO'
      ORDER BY v.fecha_venta DESC, v.placa ASC
    `;

    const [filas] = await pool.query(query);
    res.status(200).json(filas);
  } catch (error) {
    console.error('Error al consultar vehículos vendidos:', error);
    res.status(500).json({ error: 'Error al consultar la base de datos' });
  }
});

// REGISTRAR VENTA DE VEHÍCULO
app.post('/api/vehiculos/vender', async (req, res) => {
  const {
    placa,
    cedula_cliente,
    nombre_cliente,
    telefono = '',
    direccion = '',
    precio_venta,
    fecha_venta,
  } = req.body || {};

  console.log(' Venta recibida para vehículo:', placa);

  if (!placa || !cedula_cliente || !nombre_cliente || !precio_venta || Number(precio_venta) <= 0) {
    return res.status(400).json({ error: 'Faltan datos obligatorios para registrar la venta.' });
  }

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const [vehiculoActual] = await connection.query(
      `SELECT v.precio_compra AS precioCompra, v.estado, a.aporte_raul AS aporteRaul, a.aporte_hector AS aporteHector
       FROM vehiculos v
       LEFT JOIN aportes_socios a ON a.placa = v.placa
       WHERE v.placa = ?`,
      [placa]
    );

    if (!vehiculoActual || vehiculoActual.length === 0) {
      return res.status(404).json({ error: 'Vehículo no encontrado para vender.' });
    }

    if ((vehiculoActual[0]?.estado || '').toUpperCase() === 'VENDIDO') {
      return res.status(400).json({ error: 'Este vehículo ya fue vendido.' });
    }

    const infoVehiculo = vehiculoActual[0];
    const precioCompra = Number(infoVehiculo.precioCompra || 0);
    const aporteRaul = Number(infoVehiculo.aporteRaul || 0);
    const aporteHector = Number(infoVehiculo.aporteHector || 0);

    const [gastosResult] = await connection.query(
      `SELECT COALESCE(SUM(valor), 0) AS totalGastos FROM gastos WHERE placa = ?`,
      [placa]
    );
    const totalGastos = Number(gastosResult[0]?.totalGastos || 0);

    const utilidadNeta = Number(precio_venta) - (aporteRaul + aporteHector + totalGastos);
    const mitadUtilidad = utilidadNeta / 2;
    const gastosRaul = totalGastos / 2;
    const gastosHector = totalGastos / 2;
    const gananciaRaul = mitadUtilidad;
    const gananciaHector = mitadUtilidad;

    const liquidacionRaul = aporteRaul + gastosRaul + gananciaRaul;
    const liquidacionHector = aporteHector + gastosHector + gananciaHector;
    const gananciaNeta = utilidadNeta;

    await connection.query(
      `INSERT INTO clientes (cedula, nombres, telefono, direccion) 
       VALUES (?, ?, ?, ?) 
       ON DUPLICATE KEY UPDATE nombres = VALUES(nombres), telefono = VALUES(telefono), direccion = VALUES(direccion)`,
      [cedula_cliente, nombre_cliente, telefono, direccion]
    );

    const fechaVenta = fecha_venta || new Date().toISOString().slice(0, 10);

    await connection.query(
      `UPDATE vehiculos SET 
         estado = 'VENDIDO',
         precio_venta = ?,
         fecha_venta = ?,
         ganancia_neta = ?,
         liquidacion_raul = ?,
         liquidacion_hector = ?,
         observaciones = COALESCE(CONCAT(observaciones, '\nVenta registrada: ', ?), CONCAT('Venta registrada: ', ?))
       WHERE placa = ?`,
      [
        Number(precio_venta),
        fechaVenta,
        gananciaNeta,
        liquidacionRaul,
        liquidacionHector,
        fechaVenta,
        fechaVenta,
        placa,
      ]
    );

    await connection.commit();
    console.log('✅ Venta registrada para la placa:', placa);
    res.status(201).json({
      mensaje: 'Venta registrada con éxito',
      placa,
      liquidacion: {
        precioVenta: Number(precio_venta),
        precioCompra,
        totalGastos,
        utilidadNeta,
        gananciaNeta,
        aporteRaul,
        aporteHector,
        gastosRaul,
        gastosHector,
        gananciaRaul,
        gananciaHector,
        totalRaul: liquidacionRaul,
        totalHector: liquidacionHector,
        mitadUtilidad,
        liquidacionRaul,
        liquidacionHector,
      },
    });
  } catch (error) {
    await connection.rollback();
    console.error('Error al registrar la venta del vehículo:', error);
    res.status(500).json({ error: 'Error al registrar la venta' });
  } finally {
    connection.release();
  }
});

// CONSULTAR UN VEHÍCULO POR PLACA (DEVUELVE DD/MM/YYYY)
app.get('/api/vehiculos/:placa', async (req, res) => {
  const { placa } = req.params;
  try {
    const query = `
      SELECT 
        v.placa, v.marca, v.modelo, v.anio, v.color, v.combustible,
        DATE_FORMAT(v.fecha_compra, '%d/%m/%Y') AS fechaCompra, 
        v.precio_compra AS precioCompra,
        v.precio_venta AS precioVenta,
        DATE_FORMAT(v.fecha_venta, '%d/%m/%Y') AS fechaVenta,
        v.estado,
        v.ganancia_neta AS gananciaNeta,
        v.liquidacion_raul AS liquidacionRaul,
        v.liquidacion_hector AS liquidacionHector,
        v.numero_traspasos AS numeroTraspasos, v.sri, v.coopaire, v.ant,
        v.total_adeudado AS totalAdeudado, v.motor,
        v.estetica_exterior AS esteticaExterior, v.estetica_interior AS esteticaInterior,
        v.observaciones, v.foto_principal AS fotoPrincipal,
        d.cedula AS cedulaDueno, d.nombres AS propietarioAnterior, d.cedula AS cedulaPropietario, d.telefono AS telefonoPropietario,
        a.aporte_raul AS aporteRaul, a.aporte_hector AS aporteHector
      FROM vehiculos v
      LEFT JOIN duenos d ON v.cedula_dueno = d.cedula
      LEFT JOIN aportes_socios a ON v.placa = a.placa
      WHERE v.placa = ?
    `;

    const [filas] = await pool.query(query, [placa]);

    if (filas.length === 0) {
      return res.status(404).json({ error: 'Vehículo no encontrado' });
    }

    res.status(200).json(filas[0]);
  } catch (error) {
    console.error('Error al obtener el vehículo:', error);
    res.status(500).json({ error: 'Error al consultar la base de datos' });
  }
});

// REGISTRAR VEHÍCULO (CONVIERTE DD/MM/YYYY A YYYY-MM-DD PARA MYSQL)
app.post('/api/vehiculos', upload.single('foto'), async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const data = req.body;
    
    // Ruta pública de la imagen
    const rutaImagen = req.file 
      ? `/uploads/${req.file.filename}` 
      : (data.fotoPrincipal || '');

    if (req.file) {
      console.log('📷 Foto recibida y guardada exitosamente:', rutaImagen);
    }

    // 1. Guardar/Actualizar Dueño
    if (data.cedulaDueno) {
      await connection.query(
        `INSERT INTO duenos (cedula, nombres, telefono) 
         VALUES (?, ?, ?) 
         ON DUPLICATE KEY UPDATE nombres = VALUES(nombres), telefono = VALUES(telefono)`,
        [data.cedulaDueno, data.nombreDueno || '', data.telefonoDueno || '']
      );
    }

    // 2. Convertir la fecha DD/MM/YYYY a YYYY-MM-DD para la inserción
    let fechaMySQL = null;
    if (data.fechaCompra && data.fechaCompra.includes('/')) {
      const partes = data.fechaCompra.split('/');
      if (partes.length === 3) {
        fechaMySQL = `${partes[2]}-${partes[1]}-${partes[0]}`;
      }
    } else {
      fechaMySQL = data.fechaCompra || null;
    }

    // 3. Guardar Vehículo en MySQL
    const sqlVehiculo = `
      INSERT INTO vehiculos (
        placa, marca, modelo, tipo_vehiculo, anio, color, combustible,
        fecha_compra, precio_compra, numero_traspasos, sri, coopaire, ant,
        total_adeudado, motor, estetica_exterior, estetica_interior,
        observaciones, foto_principal, cedula_dueno
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    await connection.query(sqlVehiculo, [
      data.placa,
      data.marca,
      data.modelo,
      data.tipoVehiculo || 'Camioneta',
      data.anio,
      data.color,
      data.combustible,
      fechaMySQL,
      data.precioCompra,
      data.numeroTraspasos,
      data.sri,
      data.coopaire,
      data.ant,
      data.totalAdeudado,
      data.motor,
      data.esteticaExterior,
      data.esteticaInterior,
      data.observaciones,
      rutaImagen,
      data.cedulaDueno || null,
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
    console.log('✅ Vehículo guardado correctamente con placa:', data.placa);
    console.log('🖼️ URL pública de la imagen registrada:', rutaImagen);

    res.status(201).json({ mensaje: 'Vehículo registrado con éxito', fotoUrl: rutaImagen });
  } catch (error) {
    await connection.rollback();
    console.error('Error al guardar en BD:', error);
    res.status(500).json({ error: 'Error al registrar en la base de datos' });
  } finally {
    connection.release();
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Servidor ejecutándose en puerto ${PORT}`);
});