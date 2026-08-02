# Clean Architecture v1.0 - Órbita Rodante

## Objetivo

Mantener el proyecto organizado, escalable y fácil de mantener durante todo su ciclo de vida.

La aplicación seguirá la arquitectura:

presentation
↓
domain
↓
data


Presentation → pantallas.

Domain → reglas del negocio.

Data → conexión con API y MySQL.
---

# Domain

Contiene las reglas del negocio.

## Entities

Representan los objetos principales del negocio.

Entidades:

- Usuario
- Dueño
- Cliente
- Vehículo
- AporteSocio

---

## Repositories

Definen los contratos del negocio.

Repositorios:

- UsuarioRepository
- VehiculoRepository
- DuenoRepository
- ClienteRepository
- AporteSocioRepository

---

## UseCases

Acciones principales del negocio.

Casos de Uso:

- IniciarSesion
- RegistrarVehiculo
- EditarVehiculo
- ConsultarVehiculo
- RegistrarDueno
- RegistrarCliente
- RegistrarAporteSocio

---

# Data

Contiene el acceso a la información.

## Datasources

Responsables de conectarse con:

- API Backend
- MySQL

---

## DTO

Objetos para transportar información.

---

## Repository Implementations

Implementan los contratos definidos en Domain.

---

# Presentation

Responsable de la interfaz de usuario.

## Screens

Pantallas:

- Bienvenida
- Login
- Dashboard
- RegistroVehiculo
- ConsultaVehiculo
- EditarVehiculo

---

## Components

Componentes reutilizables:

- Botones
- Inputs
- Cards
- Modales
- Menús desplegables

---

## Navigation

Controla el flujo entre pantallas.

---

# Shared

Elementos compartidos por toda la aplicación.

## Constants

Constantes globales.

---

## Theme

Colores oficiales.

---

## Helpers

Funciones auxiliares.

---

## Types

Tipos globales TypeScript.

---

# Regla Principal

Las pantallas nunca accederán directamente a MySQL.

Flujo obligatorio:

Pantalla
↓
UseCase
↓
Repository
↓
Datasource
↓
Backend
↓
MySQL