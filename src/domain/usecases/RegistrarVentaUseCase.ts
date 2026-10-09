/*
|--------------------------------------------------------------------------
| CAPA DE DOMINIO: CASO DE USO REGISTRAR VENTA
|--------------------------------------------------------------------------
*/
import { VehiculoRepository } from '../repositories/VehiculoRepository';

export interface VentaVehiculoInput {
  placa: string;
  cedula_cliente: string;
  nombre_cliente: string;
  telefono: string;
  direccion: string;
  precio_venta: number;
  fecha_venta: string;
}

export default class RegistrarVentaUseCase {
  constructor(private vehiculoRepository: VehiculoRepository) {}

  async execute(venta: VentaVehiculoInput): Promise<void> {
    if (!venta.placa || !venta.cedula_cliente || !venta.nombre_cliente) {
      throw new Error('La placa, la cédula y el nombre del cliente son obligatorios.');
    }

    if (!venta.precio_venta || Number(venta.precio_venta) <= 0) {
      throw new Error('El precio de venta debe ser mayor a cero.');
    }

    await this.vehiculoRepository.registrarVenta(venta);
  }
}
