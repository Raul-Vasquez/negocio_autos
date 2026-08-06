const express = require('express');

const router = express.Router();

router.post('/login', async (req, res) => {

  return res.status(200).json({
    mensaje: 'Ruta login creada'
  });

});

module.exports = router;