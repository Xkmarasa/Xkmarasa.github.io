const pool = require('./db'); // Ajusta la ruta si es necesario

async function testConnection() {
  try {
    const client = await pool.connect();
    console.log('✅ Conexión exitosa a PostgreSQL');
    
    // Opcional: Ejecuta una consulta de prueba
    const res = await client.query('SELECT NOW() as current_time');
    console.log('Hora actual en la DB:', res.rows[0].current_time);
    
    client.release(); // Libera el cliente
  } catch (err) {
    console.error('❌ Error al conectar a PostgreSQL:', err.message);
  } finally {
    await pool.end(); // Cierra el pool de conexiones
  }
}

testConnection();