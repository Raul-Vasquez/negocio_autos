# Infraestructura v1.0 - Órbita Rodante

## Objetivo

Centralizar todos los servicios necesarios para la aplicación utilizando Docker.

---

## Servicios Iniciales

### MySQL

Responsable de almacenar toda la información del negocio.

Información que almacenará:

- Usuarios
- Vehículos
- Dueños
- Clientes
- Aportes de Socios

---

### Backend

Responsable de procesar la lógica de negocio.

Tecnología:

- Node.js
- Express

Funciones:

- Autenticación
- Registro de vehículos
- Registro de clientes
- Registro de dueños
- Consulta de información

---

### Aplicación Móvil

Tecnología:

- React Native
- Expo
- TypeScript

Funciones:

- Inicio de sesión
- Registro de vehículos
- Consulta de vehículos
- Registro de clientes
- Registro de dueños


---

## Docker

Todos los servicios deberán iniciarse mediante:

docker compose up -d

---

## Arquitectura

Aplicación Móvil
↓
Backend Node.js
↓
MySQL

---

## Versión

v1.0