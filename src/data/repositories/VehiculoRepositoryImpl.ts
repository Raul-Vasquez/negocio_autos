/*
|--------------------------------------------------------------------------
| CAPA DE DATOS: IMPLEMENTACIÓN DEL REPOSITORIO VEHÍCULO
|--------------------------------------------------------------------------
*/
import { Vehiculo } from '../../domain/entities/Vehiculo';
import { VehiculoRepository } from '../../domain/repositories/VehiculoRepository';
// @ts-ignore
import { crearVehiculoApi, obtenerVehiculosApi } from '../datasources/VehiculoApiDatasource';

export default class VehiculoRepositoryImpl implements VehiculoRepository {
  async crear(vehiculo: Vehiculo): Promise<void> {
    await crearVehiculoApi(vehiculo);
  }

  async obtenerTodos(): Promise<Vehiculo[]> {
    return await obtenerVehiculosApi();
  }
}