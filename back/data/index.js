const express = require('express');
const cors = require('cors'); // Añade esta línea
const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');
const pool = require('./db.js');

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
// Configuración SSL para HTTPS (Let's Encrypt)
let sslOptions = null;

// Intentar cargar certificados de Let's Encrypt
try {
  sslOptions = {
    key: fs.readFileSync('/etc/letsencrypt/live/93.189.91.62/privkey.pem', 'utf8'),
    cert: fs.readFileSync('/etc/letsencrypt/live/93.189.91.62/fullchain.pem', 'utf8')
  };
  console.log('✅ Certificados SSL cargados correctamente');
} catch (error) {
  console.log('⚠️  No se encontraron certificados de Let\'s Encrypt');
  console.log('💡 Para habilitar HTTPS, ejecuta:');
  console.log('   sudo certbot certonly --standalone -d 93.189.91.62');
}

// Función para crear servidor HTTP/HTTPS
function createServer() {
  const PORT = process.env.PORT || 8080;  // Puerto 8080 para HTTP
  const HTTPS_PORT = process.env.HTTPS_PORT || 8443;  // Puerto 8443 para HTTPS
  
  // Redirección HTTP -> HTTPS
  app.use((req, res, next) => {
    if (req.header('x-forwarded-proto') !== 'https' && sslOptions) {
      res.redirect(`https://${req.header('host')}${req.url}`);
    } else {
      next();
    }
  });
  
  // Crear servidor HTTP con manejo de errores
  const httpServer = http.createServer(app);
  httpServer.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.log(`⚠️  Puerto ${PORT} ocupado. Probando puerto ${PORT + 1}...`);
      httpServer.listen(PORT + 1, '0.0.0.0', () => {
        console.log(`🌐 Servidor HTTP corriendo en puerto ${PORT + 1}`);
      });
    } else {
      console.error('❌ Error en servidor HTTP:', err.message);
    }
  });
  
  httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(`🌐 Servidor HTTP corriendo en puerto ${PORT}`);
  });
  
  // Crear servidor HTTPS si los certificados existen
  if (sslOptions) {
    try {
      const httpsServer = https.createServer(sslOptions, app);
      httpsServer.on('error', (err) => {
        if (err.code === 'EADDRINUSE') {
          console.log(`⚠️  Puerto ${HTTPS_PORT} ocupado. Probando puerto ${HTTPS_PORT + 1}...`);
          httpsServer.listen(HTTPS_PORT + 1, '0.0.0.0', () => {
            console.log(`🔒 Servidor HTTPS corriendo en puerto ${HTTPS_PORT + 1}`);
            console.log(`🔗 Accede a: https://93.189.91.62:${HTTPS_PORT + 1}`);
          });
        } else {
          console.error('❌ Error en servidor HTTPS:', err.message);
        }
      });
      
      httpsServer.listen(HTTPS_PORT, '0.0.0.0', () => {
        console.log(`🔒 Servidor HTTPS corriendo en puerto ${HTTPS_PORT}`);
        console.log(`🔗 Accede a: https://93.189.91.62:${HTTPS_PORT}`);
      });
    } catch (error) {
      console.error('❌ Error creando servidor HTTPS:', error.message);
    }
  } else {
    console.log('⚠️  Solo HTTP disponible. Configura Let\'s Encrypt para HTTPS');
  }
}

// Iniciar servidor
createServer();