# Órbita Rodante v1.0

## Descripción

Órbita Rodante es una aplicación móvil para gestionar la compra y venta de vehículos seminuevos.

Los socios del negocio son:

- Raúl Vásquez
- Héctor Mora

La aplicación permitirá registrar vehículos, propietarios, clientes y controlar la inversión realizada por cada socio.

---

# Entidades del Negocio

## Usuario

Representa a las personas autorizadas para ingresar al sistema.

### Campos

- Nombres
- Apellidos
- Usuario
- Contraseña

### Futuras mejoras

- Huella dactilar
- JWT Token
- Recuperación de contraseña

---

## Dueño

Representa al propietario registrado en la matrícula del vehículo.

### Campos

- Nombres
- Cédula
- Dirección
- Teléfono
- Ciudad

---

## Cliente

Representa a la persona que compra un vehículo.

### Campos

- Nombres
- Cédula
- Dirección
- Teléfono
- Ciudad

---

## Vehículo

Representa el activo principal del negocio.

### Clave Principal

- Placa

Reglas:

- Debe ser única.
- Debe almacenarse en mayúsculas.
- Formato ejemplo: PAS-1245.

---

# Información del Vehículo

## Datos Generales

- Placa
- Marca
- Modelo
- Año
- Color
- Tipo de Combustible
- Fecha de Compra
- Precio de Compra
- Número de Traspasos

---

## Valores Adeudados

- SRI
- COOPAIRE
- ANT
- Total Adeudado

---

## Condición del Vehículo

- Estado del Motor
- Estado Estético Exterior
- Estado Estético Interior
- Observaciones

Opciones sugeridas:

- Excelente
- Bueno
- Regular
- Malo

---

## Fotografía

- Foto Principal

---

## Inversión de Socios

- Monto aportado por Raúl Vásquez
- Monto aportado por Héctor Mora

---

# Relación de Entidades

Dueño
↓
Vehículo
↓
Cliente

Vehículo
↓
Inversión de Socios

---

# Arquitectura del Proyecto

src/

├── domain/
├── data/
├── presentation/
└── shared/

---

# Versión Actual

v1.0

Módulos definidos:

- Login
- Vehículos
- Clientes
- Dueños

Pendiente:

- Base de datos MySQL
- Docker
- Backend Node.js
- JWT
- Huella dactilar
- APK Android