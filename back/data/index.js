const express = require('express');
const cors = require('cors'); // Añade esta línea
const pool = require('./db.js');

const app = express();
app.use(cors()); // Añade esta línea
app.use(express.json());

// Ruta GET (obtener datos)
app.get('/data', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM property');
    res.setHeader('Content-Type', 'application/json');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Ruta POST (crear datos) - CORREGIDA
app.post('/data', async (req, res) => {
  try {
    const {
      id,
      price,
      description,
      ubi,
      baños,
      tamaño,
      construido,
      terraza,
      imagenes,
      name,
    } = req.body;

    const values = [
      id,
      price,
      description,
      ubi,
      baños,
      tamaño,
      construido,
      terraza,
      JSON.stringify(imagenes || []),
      name || null,
    ];

    const insertSql =
      'INSERT INTO property (id, price, description, ubi, "baños", "tamaño", construido, terraza, imagenes, name) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *';

    const { rows } = await pool.query(insertSql, values);
    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Ruta raíz para evitar "Cannot GET /"
app.get('/', (req, res) => {
  res.send('API de Propiedades. Use /data para acceder a los datos.');
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

// Ruta PUT (actualizar datos) - AÑADE ESTO
app.put('/data/:id', async (req, res) => {
  try {
      const { id } = req.params;
      const {
          price,
          description,
          ubi,
          baños,
          tamaño,
          construido,
          terraza,
          imagenes,
          name,
      } = req.body;

      console.log('📝 Actualizando propiedad ID:', id);
      console.log('📦 Datos recibidos:', req.body);

      const values = [
          price,
          description,
          ubi,
          baños,
          tamaño,
          construido,
          terraza,
          JSON.stringify(imagenes || []),
          name || null,
          parseInt(id)  // Asegurar que sea número
      ];

      const updateSql = `
          UPDATE property 
          SET price = $1, description = $2, ubi = $3, "baños" = $4, 
              "tamaño" = $5, construido = $6, terraza = $7, 
              imagenes = $8, name = $9 
          WHERE id = $10 
          RETURNING *
      `;

      const { rows } = await pool.query(updateSql, values);
      
      if (rows.length === 0) {
          return res.status(404).json({ error: 'Propiedad no encontrada' });
      }

      console.log('✅ Propiedad actualizada:', rows[0]);
      res.json(rows[0]);
  } catch (err) {
      console.error('❌ Error en PUT:', err);
      res.status(500).json({ error: err.message });
  }
});
// Iniciar servidor
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});