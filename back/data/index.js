// index.js (versión corregida)
const express = require('express');
const pool = require('./db.js');

const app = express();
app.use(express.json());

// Ruta GET
app.get('/data', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM platos');
    res.json(rows); // Solo una respuesta
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Ruta POST (corregido 'imagen' -> 'image')
app.post('/data', async (req, res) => {
  const { id, price, description, image } = req.body; // Cambiado a 'image'
  try {
    const { rows } = await pool.query(
      'INSERT INTO platos (id, price, description, image) VALUES ($1, $2, $3, $4) RETURNING *',
      [id, price, description, image]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Ruta DELETE (mejorada)
app.delete('/data/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const { rowCount } = await pool.query(
      'DELETE FROM platos WHERE id = $1',
      [id]
    );
    res.status(rowCount ? 200 : 404).json(
      rowCount 
        ? { message: 'Plato eliminado correctamente' }
        : { error: 'Plato no encontrado' }
    );
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Ruta raíz
app.get('/', (req, res) => {
  res.send('API de platos. Use /data para acceder a los datos.');
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
