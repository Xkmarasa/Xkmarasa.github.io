/**
 * Script para exportar la base de datos PostgreSQL a archivos JSON
 * Uso: node export-db.js
 */

const pool = require('./data/db.js');
const fs = require('fs');
const path = require('path');

const OUTPUT_DIR = path.join(__dirname, 'data', 'exports');

// Tablas a exportar
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

async function exportTable(tableName) {
  try {
    const result = await pool.query(`SELECT * FROM ${tableName}`);
    const data = result.rows;
    
    const filePath = path.join(OUTPUT_DIR, `${tableName}.json`);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    
    console.log(`✓ Exportados ${data.length} registros de "${tableName}" -> ${filePath}`);
    return data;
  } catch (error) {
    console.error(`✗ Error exportando "${tableName}":`, error.message);
    return [];
  }
}

async function exportAll() {
  console.log('🚀 Iniciando exportación de base de datos...\n');
  
  // Crear directorio de salida si no existe
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    console.log(`📁 Creado directorio: ${OUTPUT_DIR}\n`);
  }

  const allData = {};
  
  for (const table of TABLES) {
    allData[table] = await exportTable(table);
  }

  // Exportar todo en un solo archivo
  const allFilePath = path.join(OUTPUT_DIR, 'all_data.json');
  fs.writeFileSync(allFilePath, JSON.stringify(allData, null, 2));
  console.log(`\n✓ Exportación completa: ${allFilePath}`);

  await pool.end();
  console.log('\n✅ Proceso terminado');
}

exportAll();

