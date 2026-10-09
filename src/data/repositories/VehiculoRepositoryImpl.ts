/*
|--------------------------------------------------------------------------
| CAPA DE DATOS: IMPLEMENTACIÓN DEL REPOSITORIO VEHÍCULO
|--------------------------------------------------------------------------
*/
import { Vehiculo } from '../../domain/entities/Vehiculo';
import { VehiculoRepository } from '../../domain/repositories/VehiculoRepository';
// @ts-ignore
import { crearVehiculoApi, obtenerVehiculosApi, obtenerVehiculosVendidosApi, registrarVentaApi } from '../datasources/VehiculoApiDatasource';

export default class VehiculoRepositoryImpl implements VehiculoRepository {
  async crear(vehiculo: Vehiculo): Promise<void> {
    await crearVehiculoApi(vehiculo);
  }

  async obtenerTodos(): Promise<Vehiculo[]> {
    return await obtenerVehiculosApi();
  }

  async obtenerVendidos(): Promise<Vehiculo[]> {
    return await obtenerVehiculosVendidosApi();
  }

  async registrarVenta(venta: {
    placa: string;
    cedula_cliente: string;
    nombre_cliente: string;
    telefono?: string;
    direccion?: string;
    precio_venta: number;
    fecha_venta: string;
  }): Promise<void> {
    await registrarVentaApi(venta);
  }
}