const express = require('express');
const cors = require('cors');
const authRoutes =
require('./presentation/routes/authRoutes');



const app = express();

/*
  Permite peticiones desde la aplicación móvil.
*/
app.use(cors());

/*
  Permite recibir datos en formato JSON.
*/
app.use(express.json());

/*
  Ruta de prueba para verificar que la API está activa.
*/
app.get('/api/health', (req, res) => {
  res.status(200).json({
    mensaje: 'API Órbita Rodante operativa'
  });
});

const PORT = process.env.PORT || 3000;


app.use('/api/auth', authRoutes);

/*
  Inicia el servidor.
*/
app.listen(PORT, () => {
  console.log(`✅ Servidor ejecutándose en puerto ${PORT}`);
});