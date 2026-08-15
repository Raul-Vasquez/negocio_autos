/*
|--------------------------------------------------------------------------
| CAPA DE DOMINIO: ENTIDAD VEHÍCULO
| Define el modelo de negocio limpio alineado a la base de datos.
|--------------------------------------------------------------------------
*/
export interface Vehiculo {
  id?: string;
  placa: string;
  marca: string;
  modelo: string;
  tipoVehiculo: string;
  anio: number;
  color: string;
  combustible: string;
  fechaCompra: string;
  precioCompra: number;
  numeroTraspasos: number;
  sri: number;
  coopaire: number;
  ant: number;
  totalAdeudado: number;
  motor: string;
  esteticaExterior: string;
  esteticaInterior: string;
  observaciones: string;
  fotoPrincipal: string;
  cedulaDueno: string;
  nombreDueno?: string;
  telefonoDueno?: string;
  aporteRaul: number;
  aporteHector: number;
}