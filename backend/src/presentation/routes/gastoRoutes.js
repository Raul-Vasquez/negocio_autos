const express = require('express');
const router = express.Router();
const gastoRepository = require('../../infrastructure/repositories/GastoRepository');
const Gasto = require('../../domain/gastos/Gasto');

// REGISTRAR GASTO
router.post('/', async (req, res) => {
  try {
    const {
      placa,
      tipo_gasto,
      tipoGasto,
      registrado_por,
      registradoPor,
      valor,
      descripcion,
      fecha_gasto,
      fechaGasto,
    } = req.body;

    // Convierte de DD/MM/YYYY a YYYY-MM-DD para MySQL
    let fechaEntrada = fecha_gasto || fechaGasto;
    let fechaFormateada = fechaEntrada;
    if (fechaEntrada && fechaEntrada.includes('/')) {
      const [dia, mes, anio] = fechaEntrada.split('/');
      fechaFormateada = `${anio}-${mes}-${dia}`;
    }

    const nuevoGasto = new Gasto({
      placa,
      tipo_gasto: tipo_gasto || tipoGasto,
      registrado_por: registrado_por || registradoPor,
      valor,
      descripcion,
      fecha_gasto: fechaFormateada,
    });

    await gastoRepository.guardar(nuevoGasto);
    console.log('✅ Gasto guardado para vehículo:', placa);
    res.status(201).json({ mensaje: 'Gasto registrado con éxito' });
  } catch (error) {
    console.error('Error al guardar gasto:', error);
    res.status(500).json({ error: 'Error al registrar el gasto' });
  }
});

// CONSULTAR GASTOS POR PLACA
router.get('/:placa', async (req, res) => {
  try {
    const { placa } = req.params;
    const gastos = await gastoRepository.obtenerPorPlaca(placa);
    res.status(200).json(gastos);
  } catch (error) {
    console.error('Error al consultar gastos:', error);
    res.status(500).json({ error: 'Error al consultar los gastos' });
  }
});

module.exports = router;