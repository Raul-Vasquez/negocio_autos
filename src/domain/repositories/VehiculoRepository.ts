/*
|--------------------------------------------------------------------------
| CAPA DE DATOS: INTERFAZ REPOSITORIO VEHÍCULO
|--------------------------------------------------------------------------
*/
import { Vehiculo } from '../entities/Vehiculo';

export interface VehiculoRepository {
  crear(vehiculo: Vehiculo): Promise<void>;
  obtenerTodos(): Promise<Vehiculo[]>;
}