const express = require('express');
const cors = require('cors'); // Añade esta línea
const fs = require('fs');
const path = require('path');
const pool = require('./db.js');

const app = express();
app.use(cors()); // Añade esta línea
app.use(express.json());

// Ruta de almacenamiento para noticias (JSON en disco)
const newsFilePath = path.join(__dirname, 'news.json');
function readNewsFromDisk() {
  try {
    if (!fs.existsSync(newsFilePath)) return [];
    const raw = fs.readFileSync(newsFilePath, 'utf8');
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr : [];
  } catch (e) { return []; }
}
function writeNewsToDisk(arr) {
  fs.writeFileSync(newsFilePath, JSON.stringify(arr, null, 2), 'utf8');
}

// Ruta GET (obtener datos)
app.get('/data', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM property');
    return res.json(rows);
  } catch (err) {
    if (res.headersSent) return;
    return res.status(500).json({ error: err.message });
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
    return res.status(201).json(rows[0]);
  } catch (err) {
    if (res.headersSent) return;
    return res.status(500).json({ error: err.message });
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
    return res.status(200).json({ message: 'Propiedad eliminada correctamente' });
  } catch (err) {
    if (res.headersSent) return;
    return res.status(500).json({ error: err.message });
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
      return res.json(rows[0]);
  } catch (err) {
      console.error('❌ Error en PUT:', err);
      if (res.headersSent) return;
      return res.status(500).json({ error: err.message });
  }
});

// --- Rutas NEWS (JSON file based) ---
app.get('/news', (req, res) => {
  try {
    const items = readNewsFromDisk();
    return res.json(items);
  } catch (err) {
    if (res.headersSent) return;
    return res.status(500).json({ error: err.message });
  }
});

app.post('/news', (req, res) => {
  try {
    const items = readNewsFromDisk();
    const { title, description, link, image, date, id } = req.body || {};
    const item = {
      id: id != null ? id : Date.now(),
      title: title || '',
      description: description || '',
      link: link || '',
      image: image || '',
      date: date != null ? date : Date.now()
    };
    items.unshift(item);
    writeNewsToDisk(items);
    return res.status(201).json(item);
  } catch (err) {
    if (res.headersSent) return;
    return res.status(500).json({ error: err.message });
  }
});

app.put('/news/:id', (req, res) => {
  try {
    const items = readNewsFromDisk();
    const id = req.params.id;
    const idx = items.findIndex(n => String(n.id) === String(id));
    if (idx === -1) return res.status(404).json({ error: 'Noticia no encontrada' });
    const { title, description, link, image, date } = req.body || {};
    const updated = Object.assign({}, items[idx], {
      title: title != null ? title : items[idx].title,
      description: description != null ? description : items[idx].description,
      link: link != null ? link : items[idx].link,
      image: image != null ? image : items[idx].image,
      date: date != null ? date : items[idx].date
    });
    items[idx] = updated;
    writeNewsToDisk(items);
    return res.json(updated);
  } catch (err) {
    if (res.headersSent) return;
    return res.status(500).json({ error: err.message });
  }
});

app.delete('/news/:id', (req, res) => {
  try {
    const items = readNewsFromDisk();
    const id = req.params.id;
    const next = items.filter(n => String(n.id) !== String(id));
    if (next.length === items.length) return res.status(404).json({ error: 'Noticia no encontrada' });
    writeNewsToDisk(next);
    return res.json({ message: 'Noticia eliminada' });
  } catch (err) {
    if (res.headersSent) return;
    return res.status(500).json({ error: err.message });
  }
});
// Iniciar servidor
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});