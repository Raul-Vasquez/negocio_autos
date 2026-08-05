const pool = require('./infrastructure/database/connection');

async function iniciarBackend() {
  try {
    const [rows] = await pool.query('SELECT VERSION() AS version');

    console.log('✅ Conexión exitosa con MySQL');
    console.log(rows);

    process.exit(0);

  } catch (error) {
    console.error('❌ Error de conexión');
    console.error(error);
    process.exit(1);
  }
}

iniciarBackend();