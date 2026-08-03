# Mapa Definitivo de Módulos v2.0 - Órbita Rodante

## Objetivo

Definir los módulos oficiales del sistema antes del desarrollo del backend y la construcción de la aplicación.

---

# Módulo Inicio

Responsabilidad:

Mostrar la identidad visual de Órbita Rodante.

Funciones:

- Mostrar imagen principal.
- Mostrar logo.
- Mostrar mensaje de bienvenida.
- Redirigir al Login.

---

# Módulo Login

Responsabilidad:

Controlar el acceso a la aplicación.

Registra:

- Usuario
- Contraseña

Consulta:

- Credenciales válidas

Versiones futuras:

- PIN
- Huella dactilar
- JWT

---

# Módulo Dashboard

Responsabilidad:

Ser el punto central de navegación.

Visualiza:

- Foto usuario
- Nombre usuario
- Categorías vehículos

Categorías:

- Sedan
- Camioneta
- Camión

Acciones:

- Registrar vehículo
- Inventario
- Ventas
- Configuración

---

# Módulo Vehículos

Responsabilidad:

Registrar y administrar vehículos.

Registra:

- Datos generales
- Adeudos
- Condición
- Fotografía
- Dueño
- Aporte socios

Consulta:

- Vehículo por placa
- Vehículo por marca

Edita:

- Todos los datos registrados

No elimina información.

---

# Módulo Gastos

Responsabilidad:

Registrar todos los gastos asociados a un vehículo.

Registra:

- Placa
- Tipo gasto
- Valor
- Descripción
- Fecha

Tipos de gasto:

- Mecánica
- Pintura
- Lavado
- Combustible
- Alimentación
- Transporte
- Documentación

Consulta:

- Gastos por vehículo
- Total gastos acumulados

Edita:

- Valor
- Descripción

---

# Módulo Inventario

Responsabilidad:

Visualizar vehículos registrados.

Muestra:

- Fotografía
- Placa
- Marca
- Modelo
- Año
- Precio compra
- Total gastos

Consulta:

- Por placa
- Por marca
- Por categoría

Permite:

- Abrir detalle del vehículo

---

# Módulo Detalle Vehículo

Responsabilidad:

Mostrar el historial completo.

Visualiza:

- Fotografía
- Datos generales
- Adeudos
- Condición
- Dueño
- Aporte socios
- Gastos acumulados

Permite:

- Editar vehículo
- Registrar gastos
- Consultar historial

---

# Módulo Ventas

Responsabilidad:

Registrar la salida del vehículo.

Registra:

- Placa
- Cliente
- Fecha venta
- Precio venta
- Observaciones

Consulta:

- Historial ventas

---

# Módulo Utilidades

Responsabilidad:

Calcular resultados económicos.

Fórmula:

Ganancia =
Precio Venta
-
Precio Compra
-
Total Gastos

Los adeudos no participan en cálculos.

Distribución:

- 50% Raúl Vásquez
- 50% Héctor Mora

Además:

- Reembolso gastos personales de cada socio

Visualiza:

- Ganancia total
- Ganancia Raúl
- Ganancia Héctor
- Reembolsos

---

# Módulo Historial

Responsabilidad:

Conservar toda la información histórica de un vehículo.

Muestra:

- Fotografía
- Compra
- Adeudos
- Dueño
- Gastos
- Venta
- Cliente
- Utilidad

Objetivo:

Permitir futuras consultas para apoyar nuevas decisiones de compra.

---

# Módulo Configuración

Responsabilidad:

Administrar preferencias del usuario.

Funciones futuras:

- Cambiar foto perfil
- Cambiar contraseña
- Activar huella
- Cerrar sesión

---

# Flujo General del Negocio

Inicio

↓

Login

↓

Dashboard

↓

Vehículo

↓

Gastos

↓

Inventario

↓

Detalle Vehículo

↓

Venta

↓

Utilidad

↓

Historial

---

# Reglas Oficiales

- La placa identifica al vehículo.
- Los adeudos son informativos.
- Los gastos participan en los cálculos.
- Las fotografías deben mantenerse persistentes.
- Cada vehículo conserva su historial completo.
- La arquitectura limpia será obligatoria en todas las versiones futuras.