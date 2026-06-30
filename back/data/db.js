require('dotenv').config();
const { Pool } = require('pg');

// =============================================================================
// CONFIGURACIÓN DE BASE DE DATOS - NEON
// =============================================================================
//
// Para desarrollo local: usa el archivo .env
// Para producción (Render): configura las variables en el dashboard de Render
//
// Variables necesarias:
// - DATABASE_URL: Connection string completa de Neon
// =============================================================================

// Determinar si estamos en producción (Render)
const isProduction = process.env.RENDER || process.env.NODE_ENV === 'production';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: isProduction ? {
    rejectUnauthorized: true
  } : {
    rejectUnauthorized: false
  }
});

// Manejo de errores de conexión
pool.on('error', (err) => {
  console.error('Error inesperado en la conexión a la base de datos:', err);
});

// Verificar conexión al iniciar
pool.query('SELECT NOW()')
  .then(() => console.log('✅ Conexión a Neon establecida correctamente'))
  .catch((err) => console.error('❌ Error al conectar con la base de datos:', err));

module.exports = pool;
