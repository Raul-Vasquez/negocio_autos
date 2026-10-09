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
  tipoVehiculo?: string;
  tipo_vehiculo?: string;
  anio?: number;
  color?: string;
  combustible?: string;
  fechaCompra?: string;
  fechaVenta?: string;
  precioCompra?: number;
  precioVenta?: number;
  precio_venta?: number;
  numeroTraspasos?: number;
  sri?: number;
  coopaire?: number;
  ant?: number;
  totalAdeudado?: number;
  motor?: string;
  esteticaExterior?: string;
  esteticaInterior?: string;
  observaciones?: string;
  fotoPrincipal?: string;
  foto_principal?: string;
  cedulaDueno?: string;
  nombreDueno?: string;
  telefonoDueno?: string;
  aporteRaul?: number;
  aporteHector?: number;
  gastosRaul?: number;
  gastosHector?: number;
  gananciaRaul?: number;
  gananciaHector?: number;
  totalRaul?: number;
  totalHector?: number;
  estado?: string;
  gananciaNeta?: number;
  ganancia_neta?: number;
  liquidacionRaul?: number;
  liquidacion_raul?: number;
  liquidacionHector?: number;
  liquidacion_hector?: number;
  totalGastos?: number;
}