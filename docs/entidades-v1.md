# Entidades v1.0 - Órbita Rodante

Las entidades representan los objetos principales del negocio.

## Usuario

Campos:

- usuario
- nombres
- apellidos
- contrasena

---

## Dueño

Campos:

- cedula
- nombres
- direccion
- telefono
- ciudad

---

## Cliente

Campos:

- cedula
- nombres
- direccion
- telefono
- ciudad

---

## Vehiculo

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

- sri
- coopaire
- ant
- total_adeudado

- motor
- estetica_exterior
- estetica_interior
- observaciones

- foto_principal

---

## AporteSocio

Campos:

- placa
- aporte_raul
- aporte_hector

---

## Relación de Entidades

Dueño
↓
Vehiculo
↓
Cliente

Vehiculo
↓
AporteSocio