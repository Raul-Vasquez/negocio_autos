/*
|--------------------------------------------------------------------------
| CAPA DE DOMINIO: CASO DE USO OBTENER VEHÍCULOS
|--------------------------------------------------------------------------
*/
import { Vehiculo } from '../entities/Vehiculo';
import { VehiculoRepository } from '../repositories/VehiculoRepository';

export default class ObtenerVehiculosUseCase {
  constructor(private vehiculoRepository: VehiculoRepository) {}

  async execute(): Promise<Vehiculo[]> {
    return await this.vehiculoRepository.obtenerTodos();
  }
}