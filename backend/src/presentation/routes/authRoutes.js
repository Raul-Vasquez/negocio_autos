const express = require('express');
const loginUseCase = require('../../application/auth/LoginUseCase');

const router = express.Router();

/*
  Inicio de sesión con JWT.
*/
router.post('/login', async (req, res) => {
  try {
    const { usuario, contrasena } = req.body;

    const resultado = await loginUseCase.ejecutar(usuario, contrasena);

    if (!resultado.success) {
      return res.status(401).json(resultado);
    }

    return res.status(200).json(resultado);
  } catch (error) {
    console.error('Error en el login:', error);

    return res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
    });
  }
});

module.exports = router;