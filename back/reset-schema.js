/**
 * Script para resetear las tablas (drop + create)
 * Uso: node reset-schema.js
 */

const pool = require('./data/db.js');

const TABLES = [
  'tapas',
  'hamburguesas',
  'bocadillos',
  'cervezas',
  'ensaladas',
  'menu_infantil',
  'platos_combinados',
  'postres',
  'refrescos',
  'sandwich',
  'usuarios'
];

const SCHEMAS = {
  tapas: `
    CREATE TABLE tapas (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      price DECIMAL(10,2),
      por_unidad BOOLEAN DEFAULT false
    )
  `,
  hamburguesas: `
    CREATE TABLE hamburguesas (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      price DECIMAL(10,2),
      por_unidad BOOLEAN DEFAULT false
    )
  `,
  bocadillos: `
    CREATE TABLE bocadillos (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      price DECIMAL(10,2),
      por_unidad BOOLEAN DEFAULT false
    )
  `,
  cervezas: `
    CREATE TABLE cervezas (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      price DECIMAL(10,2),
      por_unidad BOOLEAN DEFAULT false
    )
  `,
  ensaladas: `
    CREATE TABLE ensaladas (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      price DECIMAL(10,2),
      por_unidad BOOLEAN DEFAULT false
    )
  `,
  menu_infantil: `
    CREATE TABLE menu_infantil (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      price DECIMAL(10,2),
      por_unidad BOOLEAN DEFAULT false
    )
  `,
  platos_combinados: `
    CREATE TABLE platos_combinados (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      price DECIMAL(10,2),
      por_unidad BOOLEAN DEFAULT false
    )
  `,
  postres: `
    CREATE TABLE postres (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      price DECIMAL(10,2),
      por_unidad BOOLEAN DEFAULT false
    )
  `,
  refrescos: `
    CREATE TABLE refrescos (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      price DECIMAL(10,2),
      por_unidad BOOLEAN DEFAULT false
    )
  `,
  sandwich: `
    CREATE TABLE sandwich (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      price DECIMAL(10,2),
      por_unidad BOOLEAN DEFAULT false
    )
  `,
  usuarios: `
    CREATE TABLE usuarios (
      id SERIAL PRIMARY KEY,
      "Usuario" VARCHAR(255) UNIQUE NOT NULL,
      contrasena VARCHAR(255) NOT NULL
    )
  `
};

async function resetTables() {
  console.log('🔄 Reseteando tablas en la base de datos...\n');

  // Primero dropear todas las tablas
  for (const tableName of TABLES) {
    try {
      await pool.query(`DROP TABLE IF EXISTS ${tableName} CASCADE`);
      console.log(`✓ Tabla "${tableName}" eliminada`);
    } catch (error) {
      console.error(`✗ Error eliminando "${tableName}":`, error.message);
    }
  }

  console.log('');

  // Crear las tablas nuevas
  for (const [tableName, schema] of Object.entries(SCHEMAS)) {
    try {
      await pool.query(schema);
      console.log(`✓ Tabla "${tableName}" creada`);
    } catch (error) {
      console.error(`✗ Error creando "${tableName}":`, error.message);
    }
  }

  await pool.end();
  console.log('\n✅ Esquema reseteado correctamente');
}

resetTables();

