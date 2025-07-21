require('dotenv').config();
const express = require('express');
const pool = require('./db.js');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
app.use(cors());
app.use(express.json());

const JWT_SECRET = 'clave-secreta-barcastello';

// Endpoint para el menú completo
app.get('/menu', async (req, res) => {
  try {
    const [
      tapas, hamburguesas, bocadillos, cervezas,
      ensaladas, menuInfantil, platosCombinados,
      postres, refrescos, sandwich
    ] = await Promise.all([
      pool.query('SELECT * FROM tapas'),
      pool.query('SELECT * FROM hamburguesas'),
      pool.query('SELECT * FROM bocadillos'),
      pool.query('SELECT * FROM cervezas'),
      pool.query('SELECT * FROM ensaladas'),
      pool.query('SELECT * FROM menu_infantil'),
      pool.query('SELECT * FROM platos_combinados'),
      pool.query('SELECT * FROM postres'),
      pool.query('SELECT * FROM refrescos'),
      pool.query('SELECT * FROM sandwich')
    ]);

    res.json({
      tapas: tapas.rows,
      hamburguesas: hamburguesas.rows,
      bocadillos: bocadillos.rows,
      cervezas: cervezas.rows,
      ensaladas: ensaladas.rows,
      menu_infantil: menuInfantil.rows,
      platos_combinados: platosCombinados.rows,
      postres: postres.rows,
      refrescos: refrescos.rows,
      sandwich: sandwich.rows
    });
  } catch (err) {
    console.error('Error en /menu:', err);
    res.status(500).json({ error: 'Error al cargar el menú' });
  }
});
app.get('/usuarios', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM usuarios');
    res.json(result.rows);
  } catch (err) {
    console.error('Error GET /usuarios:', err);
    res.status(500).json({ error: 'Error al obtener usuarios' });
  }
});

// Endpoint de login
app.post('/usuarios', async (req, res) => {
  try {
    const { usuario, contrasena } = req.body;

    if (!usuario || !contrasena) {
      return res.status(400).json({ error: 'Usuario y contraseña son requeridos' });
    }

    const result = await pool.query('SELECT * FROM usuarios WHERE "Usuario" = $1', [usuario.trim()]);
    const user = result.rows[0];

    if (!user) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    // Comparar contraseña (soporta texto plano y hash)
    let match = false;
    if (user.Contrasena.startsWith('$2a$')) {
      match = await bcrypt.compare(contrasena.trim(), user.Contrasena);
    } else {
      match = contrasena.trim() === user.Contrasena;
      // Actualizar a hash si coincide
      if (match) {
        const hash = await bcrypt.hash(contrasena, 10);
        await pool.query('UPDATE usuarios SET "Contrasena" = $1 WHERE "Usuario" = $2', [hash, user.Usuario]);
      }
    }

    if (!match) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const token = jwt.sign(
      { id: user.id, Usuario: user.Usuario },
      JWT_SECRET,
      { expiresIn: '8h' }
    );

    res.json({ 
      mensaje: 'Login exitoso',
      token,
      usuario: user.Usuario
    });

  } catch (err) {
    console.error('Error en POST /usuarios:', err);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

// Endpoint de registro
app.post('/registro', async (req, res) => {
  try {
    const { usuario, contrasena } = req.body;

    if (!usuario || !contrasena) {
      return res.status(400).json({ error: 'Usuario y contraseña son requeridos' });
    }

    const hash = await bcrypt.hash(contrasena, 10);
    await pool.query(
      'INSERT INTO usuarios ("Usuario", "Contrasena") VALUES ($1, $2)',
      [usuario.trim(), hash]
    );

    res.status(201).json({ mensaje: 'Usuario registrado exitosamente' });
  } catch (err) {
    console.error('Error en POST /registro:', err);
    res.status(500).json({ error: 'Error al registrar usuario' });
  }
});

// Endpoints básicos para cada categoría (ejemplo con cervezas)
app.get('/cervezas', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM cervezas');
    res.json(result.rows);
  } catch (err) {
    console.error('Error GET cervezas:', err);
    res.status(500).json({ error: 'Error al obtener cervezas' });
  }
});

app.post('/cervezas', async (req, res) => {
  try {
    const { nombre, precio } = req.body;
    const result = await pool.query(
      'INSERT INTO cervezas (nombre, precio) VALUES ($1, $2) RETURNING *',
      [nombre, precio]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error POST cervezas:', err);
    res.status(500).json({ error: 'Error al crear cerveza' });
  }
});

app.post('/tapas', async (req, res) => {
  try {
    const { nombre, precio } = req.body;
    const result = await pool.query(
      'INSERT INTO tapas (nombre, precio) VALUES ($1, $2) RETURNING *',
      [nombre, precio]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error POST tapas:', err);
    res.status(500).json({ error: 'Error al crear tapa' });
  }
});
app.post('/bocadillos', async (req, res) => {
  try {
    const { nombre, precio } = req.body;
    const result = await pool.query(
      'INSERT INTO bocadillos (nombre, precio) VALUES ($1, $2) RETURNING *',
      [nombre, precio]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error POST bocadillos:', err);
    res.status(500).json({ error: 'Error al crear bocadillo' });
  }
});
app.post('/ensaladas', async (req, res) => {
  try {
    const { nombre, precio } = req.body;
    const result = await pool.query(
      'INSERT INTO ensaladas (nombre, precio) VALUES ($1, $2) RETURNING *',
      [nombre, precio]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error POST ensaladas:', err);
    res.status(500).json({ error: 'Error al crear ensalada' });
  }
});
app.post('/menu_infantil', async (req, res) => {
  try {
    const { nombre, precio } = req.body;
    const result = await pool.query(
      'INSERT INTO menu_infantil (nombre, precio) VALUES ($1, $2) RETURNING *',
      [nombre, precio]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error POST menu_infantil:', err);
    res.status(500).json({ error: 'Error al crear menú infantil' });
  }
});
app.post('/platos_combinados', async (req, res) => {
  try {
    const { nombre, precio } = req.body;
    const result = await pool.query(
      'INSERT INTO platos_combinados (nombre, precio) VALUES ($1, $2) RETURNING *',
      [nombre, precio]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error POST platos_combinados:', err);
    res.status(500).json({ error: 'Error al crear plato combinado' });
  }
});
app.post('/postres', async (req, res) => {
  try {
    const { nombre, precio } = req.body;
    const result = await pool.query(
      'INSERT INTO postres (nombre, precio) VALUES ($1, $2) RETURNING *',
      [nombre, precio]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error POST postres:', err);
    res.status(500).json({ error: 'Error al crear postre' });
  }
});
app.post('/refrescos', async (req, res) => {
  try {
    const { nombre, precio } = req.body;
    const result = await pool.query(
      'INSERT INTO refrescos (nombre, precio) VALUES ($1, $2) RETURNING *',
      [nombre, precio]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error POST refrescos:', err);
    res.status(500).json({ error: 'Error al crear refresco' });
  }
});
app.post('/sandwich', async (req, res) => {
  try {
    const { nombre, precio } = req.body;
    const result = await pool.query(
      'INSERT INTO sandwich (nombre, precio) VALUES ($1, $2) RETURNING *',
      [nombre, precio]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error POST sandwich:', err);
    res.status(500).json({ error: 'Error al crear sandwich' });
  }
});
app.get('/tapas', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM tapas');
    res.json(result.rows);
  } catch (err) {
    console.error('Error GET tapas:', err);
    res.status(500).json({ error: 'Error al obtener tapas' });
  }
});
app.get('/bocadillos', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM bocadillos');
    res.json(result.rows);
  } catch (err) {
    console.error('Error GET bocadillos:', err);
    res.status(500).json({ error: 'Error al obtener bocadillos' });
  }
});
app.get('/ensaladas', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM ensaladas');
    res.json(result.rows);
  } catch (err) {
    console.error('Error GET ensaladas:', err);
    res.status(500).json({ error: 'Error al obtener ensaladas' });
  }
});
app.get('/menu_infantil', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM menu_infantil');
    res.json(result.rows);
  } catch (err) {
    console.error('Error GET menu_infantil:', err);
    res.status(500).json({ error: 'Error al obtener menú infantil' });
  }
});
app.get('/platos_combinados', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM platos_combinados');
    res.json(result.rows);
  } catch (err) {
    console.error('Error GET platos_combinados:', err);
    res.status(500).json({ error: 'Error al obtener platos combinados' });
  }
});
app.get('/postres', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM postres');
    res.json(result.rows);
  } catch (err) {
    console.error('Error GET postres:', err);
    res.status(500).json({ error: 'Error al obtener postres' });
  }
});
app.get('/refrescos', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM refrescos');
    res.json(result.rows);
  } catch (err) {
    console.error('Error GET refrescos:', err);
    res.status(500).json({ error: 'Error al obtener refrescos' });
  }
});
app.get('/sandwich', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM sandwich');
    res.json(result.rows);
  } catch (err) {
    console.error('Error GET sandwich:', err);
    res.status(500).json({ error: 'Error al obtener sandwich' });
  }
});
// Middleware para manejar errores
app.use((err, req, res, next) => {
  console.error('Error en la aplicación:', err);
  res.status(500).json({ error: 'Error interno del servidor' });
});
// Middleware para manejar rutas no encontradas
app.use((req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' });
});


// Iniciar servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor Bar Castelló corriendo en puerto ${PORT}`);
});