/*
|--------------------------------------------------------------------------
| CAPA DE DATOS: IMPLEMENTACIÓN DEL REPOSITORIO VEHÍCULO
|--------------------------------------------------------------------------
*/
import { Vehiculo } from '../../domain/entities/Vehiculo';
import { VehiculoRepository } from '../../domain/repositories/VehiculoRepository';

// @ts-ignore
import { api } from '../../shared/constants/api';

export default class VehiculoRepositoryImpl implements VehiculoRepository {
  async crear(vehiculo: Vehiculo): Promise<void> {
    await api.post('/vehiculos', vehiculo);
  }

  async obtenerTodos(): Promise<Vehiculo[]> {
    const response = await api.get('/vehiculos');
    return response.data;
  }
}