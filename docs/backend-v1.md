# Backend v1.0 - Órbita Rodante

## Objetivo

Centralizar toda la lógica de negocio y el acceso a la base de datos.

---

## Arquitectura

backend

src

├── domain
├── application
├── infrastructure
└── presentation

---

## Domain

Contiene las reglas del negocio.

Entidades:

- Usuario
- Dueño
- Cliente
- Vehículo
- AporteSocio

---

## Application

Contiene los casos de uso.

Casos principales:

- IniciarSesion
- RegistrarVehiculo
- EditarVehiculo
- ConsultarVehiculo
- RegistrarDueno
- RegistrarCliente

---

## Infrastructure

Contiene:

- MySQL
- Configuración JWT
- Variables de entorno
- Repositorios

---

## Presentation

Contiene:

- Controladores
- Rutas API

---

## API Inicial

Usuarios

- Login

Vehículos

- Registrar
- Consultar
- Editar

Dueños

- Registrar
- Consultar

Clientes

- Registrar
- Consultar

---

## Flujo

App Móvil

↓

API Node.js

↓

MySQL

---

## Seguridad Futura

- JWT
- Refresh Token
- Huella Dactilar