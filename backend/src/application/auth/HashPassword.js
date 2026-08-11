const bcrypt = require('bcrypt');

async function generarHash() {

  const password = 'Admin_Orbita_2026';

  const hash = await bcrypt.hash(password, 10);

  console.log(hash);

}

generarHash();