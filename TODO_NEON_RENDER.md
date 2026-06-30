# Plan: Conectar proyecto BarCastello a Neon para Render

## Información Recopilada:
- El proyecto usa Express + PostgreSQL (pg)
- Ya existe configuración de Neon en `back/data/db.js`
- El servidor ya importa el pool correctamente
- Dependencias necesarias ya instaladas: pg, dotenv

## Plan de Ejecución:

### 1. Actualizar configuración de base de datos
- Modificar `back/data/db.js` para usar variables de entorno
- Añadir soporte SSL para producción (Render)
- Crear archivo `.env.example` como referencia

### 2. Crear archivo .env.local
- Mantener configuración de desarrollo local
- No incluir en git (ya está en .gitignore)

### 3. Documentación para Render
- Crear guía de configuración en el dashboard de Render
- Explicar cómo configurar las variables de entorno

## Pasos:
- [x] 1. Actualizar `back/data/db.js` con configuración para producción
- [x] 2. Crear `.env.example` con las variables necesarias
- [ ] 3. ✅ Completado - Configuración lista para desarrollo y producción

