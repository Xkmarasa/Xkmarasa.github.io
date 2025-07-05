const express = require('express');
const pool = require('../db.js');

const app = express();
app.use(express.json()); // Para parsear JSON

// Ruta GET (obtener datos)
app.get('/data', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM property');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Ruta POST (crear datos)
app.post('/data', async (req, res) => {
  const { id, price, description, ubi, baños, tamaño, construido, terraza } = req.body;
  try {
    const { rows } = await pool.query(
      'INSERT INTO Property (id,price,description,ubi,baños,tamaño,construido,terraza) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
      [id, price, description, ubi, baños, tamaño, construido, terraza]
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