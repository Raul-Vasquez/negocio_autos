/*
|--------------------------------------------------------------------------
| CAPA DE DOMINIO: CASO DE USO CREAR VEHÍCULO
|--------------------------------------------------------------------------
*/
import { Vehiculo } from '../entities/Vehiculo';
import { VehiculoRepository } from '../repositories/VehiculoRepository';

export default class CrearVehiculoUseCase {
  constructor(private vehiculoRepository: VehiculoRepository) {}

  async execute(vehiculo: Vehiculo): Promise<void> {
    if (!vehiculo.placa || !vehiculo.modelo) {
      throw new Error('La placa y el modelo son obligatorios.');
    }
    await this.vehiculoRepository.crear(vehiculo);
  }
}