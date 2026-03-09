/**
 * Script para importar datos desde archivos JSON a la base de datos PostgreSQL
 * Uso: node import-db.js
 */

const pool = require('./data/db.js');
const fs = require('fs');
const path = require('path');

const INPUT_DIR = path.join(__dirname, 'data', 'exports');

// Mapeo de tablas a archivos JSON
const FILES = {
  tapas: 'tapas.json',
  hamburguesas: 'hamburguesas.json',
  bocadillos: 'bocadillos.json',
  cervezas: 'cervezas.json',
  ensaladas: 'ensaladas.json',
  menu_infantil: 'menu_infantil.json',
  platos_combinados: 'platos_combinados.json',
  postres: 'postres.json',
  refrescos: 'refrescos.json',
  sandwich: 'sandwich.json'
};

async function clearTable(tableName) {
  try {
    await pool.query(`DELETE FROM ${tableName}`);
    console.log(`✓ Tabla "${tableName}" vaciada`);
  } catch (error) {
    console.error(`✗ Error vaciando "${tableName}":`, error.message);
  }
}

async function importTable(tableName, filename) {
  const filePath = path.join(INPUT_DIR, filename);
  
  if (!fs.existsSync(filePath)) {
    console.warn(`⚠ Archivo no encontrado: ${filePath}`);
    return;
  }

  try {
    const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    
    if (!data || data.length === 0) {
      console.log(`○ No hay datos en "${filename}"`);
      return;
    }

    // Vaciar la tabla primero
    await clearTable(tableName);

    // Insertar cada registro
    for (const row of data) {
      // Extraer campos - el esquema real tiene: id, price, name, por_unidad
      const { id, name, price, por_unidad, description, image, ...extra } = row;
      
      let query, params;
      
      // Todos los registros tienen name y price
      if (por_unidad !== undefined) {
        query = `INSERT INTO ${tableName} (name, price, por_unidad) VALUES ($1, $2, $3) RETURNING *`;
        params = [name, price, por_unidad];
      } else {
        query = `INSERT INTO ${tableName} (name, price) VALUES ($1, $2) RETURNING *`;
        params = [name, price];
      }
      
      await pool.query(query, params);
    }
    
    console.log(`✓ Importados ${data.length} registros en "${tableName}"`);
  } catch (error) {
    console.error(`✗ Error importando "${tableName}":`, error.message);
  }
}

async function importAll() {
  console.log('🚀 Iniciando importación de datos...\n');

  if (!fs.existsSync(INPUT_DIR)) {
    console.error(`✗ Directorio no encontrado: ${INPUT_DIR}`);
    console.log('Primero ejecuta: node export-db.js');
    process.exit(1);
  }

  for (const [tableName, filename] of Object.entries(FILES)) {
    await importTable(tableName, filename);
  }

  await pool.end();
  console.log('\n✅ Importación completa');
}

importAll();

