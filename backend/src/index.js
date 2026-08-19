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

// CONSULTAR TODOS LOS VEHÍCULOS (DEVUELVE DD/MM/YYYY)
app.get('/api/vehiculos', async (req, res) => {
  try {
    const query = `
      SELECT 
        v.placa, v.marca, v.modelo, v.anio, v.color, v.combustible,
        DATE_FORMAT(v.fecha_compra, '%d/%m/%Y') AS fechaCompra, 
        v.precio_compra AS precioCompra,
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

// CONSULTAR UN VEHÍCULO POR PLACA (DEVUELVE DD/MM/YYYY)
app.get('/api/vehiculos/:placa', async (req, res) => {
  const { placa } = req.params;
  try {
    const query = `
      SELECT 
        v.placa, v.marca, v.modelo, v.anio, v.color, v.combustible,
        DATE_FORMAT(v.fecha_compra, '%d/%m/%Y') AS fechaCompra, 
        v.precio_compra AS precioCompra,
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
        placa, marca, modelo, anio, color, combustible,
        fecha_compra, precio_compra, numero_traspasos, sri, coopaire, ant,
        total_adeudado, motor, estetica_exterior, estetica_interior,
        observaciones, foto_principal, cedula_dueno
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    await connection.query(sqlVehiculo, [
      data.placa, data.marca, data.modelo, data.anio, data.color, data.combustible,
      fechaMySQL, data.precioCompra, data.numeroTraspasos, data.sri, data.coopaire, data.ant,
      data.totalAdeudado, data.motor, data.esteticaExterior, data.esteticaInterior,
      data.observaciones, rutaImagen, data.cedulaDueno || null
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