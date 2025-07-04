const express = require('express');
const pool = require('./db');

const app = express();
app.use(express.json()); // Para parsear JSON

// Ruta GET (obtener datos)
app.get('/data', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM Property');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Ruta POST (crear datos)
app.post('/data', async (req, res) => {
  const { name, email } = req.body;
  try {
    const { rows } = await pool.query(
      'INSERT INTO Property (id,price,description,ubi,baños,tamaño,construido,terraza) VALUES ($1, $2) RETURNING *',
      [name, email]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Iniciar servidor
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});