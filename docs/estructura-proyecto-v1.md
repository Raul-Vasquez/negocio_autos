# Estructura Proyecto v1.0

## Domain

Contiene las reglas del negocio.

- entities
- repositories
- usecases

---

## Data

Contiene acceso a datos.

- datasources
- dto
- repositories

---

## Presentation

Contiene la interfaz de usuario.

- screens
- components
- navigation

---

## Shared

Contiene elementos reutilizables.

- constants
- theme
- helpers
- types

---

## Regla Principal

presentation
↓
domain
↓
data

No se permite acceso directo desde pantallas hacia MySQL.