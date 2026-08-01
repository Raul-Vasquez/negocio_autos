# Modelo de Datos v1.0 - Órbita Rodante

## Entidades Principales

La aplicación estará compuesta por cinco entidades principales:

- Usuario
- Dueño
- Cliente
- Vehículo
- AporteSocio

---

## Usuario

Representa a las personas autorizadas para ingresar al sistema.

Campos:

- usuario
- nombres
- apellidos
- contrasena

Usuarios iniciales:

- Raúl Vásquez
- Héctor Mora

---

## Dueño

Representa al propietario registrado en la matrícula.

Campos:

- cedula
- nombres
- direccion
- telefono
- ciudad

---

## Cliente

Representa a la persona que compra un vehículo.

Campos:

- cedula
- nombres
- direccion
- telefono
- ciudad

---

## Vehículo

La placa identifica al vehículo dentro del negocio.

Campos:

- placa
- marca
- modelo
- anio
- color
- combustible
- fecha_compra
- precio_compra
- numero_traspasos

Valores adeudados:

- sri
- coopaire
- ant
- total_adeudado

Condiciones:

- motor
- estetica_exterior
- estetica_interior
- observaciones

Fotografía:

- foto_principal

---

## AporteSocio

Permite registrar el capital aportado para la compra del vehículo.

Campos:

- placa
- aporte_raul
- aporte_hector

---

## Relación del Negocio

Dueño
↓
Vehículo
↓
Cliente

Vehículo
↓
AporteSocio