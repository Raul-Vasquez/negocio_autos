# MySQL v1.0 - Órbita Rodante

## Tablas

### usuarios

- usuario
- nombres
- apellidos
- contrasena

---

### duenos

- cedula
- nombres
- direccion
- telefono
- ciudad

---

### clientes

- cedula
- nombres
- direccion
- telefono
- ciudad

---

### vehiculos

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

### aportes_socios

- placa
- aporte_raul
- aporte_hector

---

## Relaciones

Dueño
↓
Vehículo
↓
Cliente

Vehículo
↓
Aportes Socios