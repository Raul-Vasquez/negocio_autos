class Gasto {
  constructor({ placa, tipo_gasto, registrado_por, valor, descripcion, fecha_gasto }) {
    this.placa = placa;
    this.tipo_gasto = tipo_gasto;
    this.registrado_por = registrado_por;
    this.valor = valor;
    this.descripcion = descripcion;
    this.fecha_gasto = fecha_gasto;
  }
}

module.exports = Gasto;