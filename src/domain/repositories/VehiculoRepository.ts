/*
|--------------------------------------------------------------------------
| CAPA DE DATOS: INTERFAZ REPOSITORIO VEHÍCULO
|--------------------------------------------------------------------------
*/
import { Vehiculo } from '../entities/Vehiculo';

export interface VehiculoRepository {
  crear(vehiculo: Vehiculo): Promise<void>;
  obtenerTodos(): Promise<Vehiculo[]>;
  obtenerVendidos(): Promise<Vehiculo[]>;
  registrarVenta(venta: {
    placa: string;
    cedula_cliente: string;
    nombre_cliente: string;
    telefono?: string;
    direccion?: string;
    precio_venta: number;
    fecha_venta: string;
  }): Promise<void>;
}