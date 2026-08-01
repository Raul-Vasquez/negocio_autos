# Docker v1.0

## Objetivo

Centralizar la infraestructura del proyecto Órbita Rodante utilizando contenedores Docker.

## Servicios

### MySQL

Motor principal de almacenamiento.

Base de datos:

orbita_rodante

## Configuración

Las credenciales se almacenan en el archivo .env.

## Inicio

docker compose up -d

## Detener

docker compose down

## Arquitectura Actual

React Native (Expo)
↓
Backend Node.js
↓
MySQL

## Estado

Versión inicial