/**
 * Script para crear las tablas en la base de datos PostgreSQL
 * Uso: node create-schema.js
 */

const pool = require('./data/db.js');

const SCHEMAS = {
  tapas: `
    CREATE TABLE IF NOT EXISTS tapas (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      price DECIMAL(10,2),
      por_unidad BOOLEAN DEFAULT false
    )
  `,
  hamburguesas: `
    CREATE TABLE IF NOT EXISTS hamburguesas (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      price DECIMAL(10,2),
      por_unidad BOOLEAN DEFAULT false
    )
  `,
  bocadillos: `
    CREATE TABLE IF NOT EXISTS bocadillos (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      price DECIMAL(10,2),
      por_unidad BOOLEAN DEFAULT false
    )
  `,
  cervezas: `
    CREATE TABLE IF NOT EXISTS cervezas (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      price DECIMAL(10,2),
      por_unidad BOOLEAN DEFAULT false
    )
  `,
  ensaladas: `
    CREATE TABLE IF NOT EXISTS ensaladas (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      price DECIMAL(10,2),
      por_unidad BOOLEAN DEFAULT false
    )
  `,
  menu_infantil: `
    CREATE TABLE IF NOT EXISTS menu_infantil (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      price DECIMAL(10,2),
      por_unidad BOOLEAN DEFAULT false
    )
  `,
  platos_combinados: `
    CREATE TABLE IF NOT EXISTS platos_combinados (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      price DECIMAL(10,2),
      por_unidad BOOLEAN DEFAULT false
    )
  `,
  postres: `
    CREATE TABLE IF NOT EXISTS postres (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      price DECIMAL(10,2),
      por_unidad BOOLEAN DEFAULT false
    )
  `,
  refrescos: `
    CREATE TABLE IF NOT EXISTS refrescos (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      price DECIMAL(10,2),
      por_unidad BOOLEAN DEFAULT false
    )
  `,
  sandwich: `
    CREATE TABLE IF NOT EXISTS sandwich (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      price DECIMAL(10,2),
      por_unidad BOOLEAN DEFAULT false
    )
  `,
  usuarios: `
    CREATE TABLE IF NOT EXISTS usuarios (
      id SERIAL PRIMARY KEY,
      "Usuario" VARCHAR(255) UNIQUE NOT NULL,
      contrasena VARCHAR(255) NOT NULL
    )
  `
};

async function createTables() {
  console.log('🚀 Creando tablas en la base de datos...\n');

  for (const [tableName, schema] of Object.entries(SCHEMAS)) {
    try {
      await pool.query(schema);
      console.log(`✓ Tabla "${tableName}" creada`);
    } catch (error) {
      console.error(`✗ Error creando "${tableName}":`, error.message);
    }
  }

  await pool.end();
  console.log('\n✅ Esquema creado correctamente');
}

createTables();

