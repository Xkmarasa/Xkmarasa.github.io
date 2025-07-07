const express = require('express');
const pool = require('./db.js');

const app = express();
app.use(express.json());

// Ruta GET (obtener datos)
app.get('/data', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM property');
     res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify(rows, null, 2));
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Ruta POST (crear datos) - CORREGIDA
app.post('/data', async (req, res) => {
  const { id, price, description, ubi, baños, tamaño, construido, terraza } = req.body;
  try {
    const { rows } = await pool.query(
      'INSERT INTO Property (id, price, description, ubi, baños, tamaño, construido, terraza) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
      [id, price, description, ubi, baños, tamaño, construido, terraza]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Ruta raíz para evitar "Cannot GET /"
app.get('/', (req, res) => {
  res.send('API de propiedades. Use /data para acceder a los datos.');
});
// Ruta DELETE (eliminar datos por ID)
app.delete('/data/:id', async (req, res) => {
  const { id } = req.params; // Obtiene el ID de la URL
  try {
    const { rowCount } = await pool.query(
      'DELETE FROM property WHERE id = $1',
      [id]
    );
    if (rowCount === 0) {
      return res.status(404).json({ error: 'Propiedad no encontrada' });
    }
    res.status(200).json({ message: 'Propiedad eliminada correctamente' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
// Iniciar servidor
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});