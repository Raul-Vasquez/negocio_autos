# Base de Datos v1.0 - Órbita Rodante

## Tabla Usuarios

Campos:

- usuario
- nombres
- apellidos
- contrasena

---

## Tabla Dueños

Campos:

- cedula
- nombres
- direccion
- telefono
- ciudad

---

## Tabla Clientes

Campos:

- cedula
- nombres
- direccion
- telefono
- ciudad

---

## Tabla Vehiculos

Clave Principal:

- placa

Datos Generales:

- placa
- marca
- modelo
- anio
- color
- combustible
- fecha_compra
- precio_compra
- numero_traspasos

Valores Adeudados:

- sri
- coopaire
- ant
- total_adeudado

Condición:

- motor
- estetica_exterior
- estetica_interior
- observaciones

Fotografía:

- foto_principal

Relación:

- cedula_dueno

---

## Tabla AportesSocios

Campos:

- placa
- aporte_raul
- aporte_hector

---

## Relación General

Dueño
↓
Vehículo
↓
Cliente

Vehículo
↓
AporteSocios