const express = require('express');
const cors = require('cors'); // Añade esta línea
const fs = require('fs');
const path = require('path');
const pool = require('./db.js');
const https = require('https');

const app = express();
app.use(cors()); // Añade esta línea
app.use(express.json());

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  
  if (req.method === 'OPTIONS') {
      return res.sendStatus(200);
  }
  next();
});

// News storage is now handled by the database

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
      habitaciones,
      jardin,
      piscina,
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
      habitaciones || null,
      jardin || false,
      piscina || false,
    ];

    const insertSql =
      'INSERT INTO property (id, price, description, ubi, "baños", "tamaño", construido, terraza, imagenes, name, habitaciones, jardin, piscina) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13) RETURNING *';

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
          habitaciones,
          jardin,
          piscina,
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
          habitaciones || null,
          jardin || false,
          piscina || false,
          parseInt(id)  // Asegurar que sea número
      ];

      const updateSql = `
          UPDATE property 
          SET price = $1, description = $2, ubi = $3, "baños" = $4, 
              "tamaño" = $5, construido = $6, terraza = $7, 
              imagenes = $8, name = $9, habitaciones = $10, jardin = $11, piscina = $12
          WHERE id = $13 
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

// --- Rutas NEWS (Database based) ---
app.get('/news', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM "news" ORDER BY date DESC');
    return res.json(rows);
  } catch (err) {
    if (res.headersSent) return;
    return res.status(500).json({ error: err.message });
  }
});

app.post('/news', async (req, res) => {
  try {
    console.log('🔥 NEWS API: Using DATABASE version (updated code)');
    const { title, description, link, image, date, id } = req.body || {};
    const newsId = id != null ? id : Date.now().toString();
    const newsDate = date != null ? date.toString() : Date.now().toString();
    
    const values = [
      newsId,
      title || '',
      description || '',
      link || '',
      image || '',
      newsDate
    ];

    const insertSql = 'INSERT INTO "news" (id, title, description, link, image, date) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *';
    const { rows } = await pool.query(insertSql, values);
    return res.status(201).json(rows[0]);
  } catch (err) {
    if (res.headersSent) return;
    return res.status(500).json({ error: err.message });
  }
});

app.put('/news/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const { title, description, link, image, date } = req.body || {};
    
    const values = [
      title,
      description,
      link,
      image,
      date,
      id
    ];

    const updateSql = `
      UPDATE "news" 
      SET title = $1, description = $2, link = $3, image = $4, date = $5 
      WHERE id = $6 
      RETURNING *
    `;
    
    const { rows } = await pool.query(updateSql, values);
    
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Noticia no encontrada' });
    }
    
    return res.json(rows[0]);
  } catch (err) {
    if (res.headersSent) return;
    return res.status(500).json({ error: err.message });
  }
});

app.delete('/news/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const { rowCount } = await pool.query('DELETE FROM "news" WHERE id = $1', [id]);
    
    if (rowCount === 0) {
      return res.status(404).json({ error: 'Noticia no encontrada' });
    }
    
    return res.json({ message: 'Noticia eliminada' });
  } catch (err) {
    if (res.headersSent) return;
    return res.status(500).json({ error: err.message });
  }
});

// --- Login ---
app.get('/login', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT trim(username) AS username FROM rol ORDER BY trim(username) ASC');
    return res.json(rows);
  } catch (err) {
    if (res.headersSent) return;
    return res.status(500).json({ error: err.message });
  }
});

app.post('/login', async (req, res) => {
  try {
    const { usuario, contraseña, username, password } = req.body || {};

    const providedUser = usuario != null ? usuario : username;
    const providedPass = contraseña != null ? contraseña : password;
    const normalizedUser = typeof providedUser === 'string' ? providedUser.trim() : providedUser;
    const normalizedPass = typeof providedPass === 'string' ? providedPass.trim() : providedPass;

    if (!normalizedUser || !normalizedPass) {
      return res.status(400).json({ error: 'Faltan credenciales' });
    }
  
    // Tabla real: public.rol con columnas username y password (normaliza mayúsculas/espacios)
    console.log('🔐 Login intento:', { userNormalized: normalizedUser, passLength: typeof normalizedPass === 'string' ? normalizedPass.length : null });
    const sql = "SELECT btrim(username, E' \t\n\r') AS username FROM rol " +
                "WHERE lower(btrim(username, E' \t\n\r')) = lower(btrim($1, E' \t\n\r')) " +
                "AND btrim(password, E' \t\n\r') = btrim($2, E' \t\n\r') " +
                "LIMIT 1";
    const { rows } = await pool.query(sql, [normalizedUser, normalizedPass]);
    console.log('🔐 Login resultado filas:', rows ? rows.length : 0, 'userDeBD:', rows && rows[0]);

    if (!rows || rows.length === 0) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    return res.json({ message: 'Autenticación correcta', user: rows[0] });
  } catch (err) {
    if (res.headersSent) return;
    return res.status(500).json({ error: err.message });
  }
});
// Iniciar servidor
const PORT = 3000;
const options = {
key: fs.readFileSync('/etc/letsencrypt/live/mediterraneanbi.com/privkey.pem'),
  cert: fs.readFileSync('/etc/letsencrypt/live/mediterraneanbi.com/fullchain.pem')};

// Crear servidor HTTPS
https.createServer(options, app).listen(PORT, () => {
  console.log(`✅ Servidor HTTPS corriendo en https://localhost:${PORT}`);
});
