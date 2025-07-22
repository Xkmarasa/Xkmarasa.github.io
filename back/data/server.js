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

app.get('/usuarios', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM usuarios');
    res.json(result.rows);
  } catch (err) {
    console.error('Error GET /usuarios:', err);
    res.status(500).json({ error: 'Error al obtener usuarios' });
  }
});


// Endpoint para obtener todos los usuarios
app.get('/usuarios', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM usuarios');
    res.json(result.rows);
  } catch (err) {
    console.error('Error GET /usuarios:', err);
    res.status(500).json({ error: 'Error al obtener usuarios' });
  }
});

// Endpoint de registro
app.post('/registro', async (req, res) => {
  try {
    const { Usuario, contrasena } = req.body;

    // Validación
    if (!Usuario?.trim() || !contrasena?.trim()) {
      return res.status(400).json({ error: 'Usuario y contraseña son requeridos' });
    }

    // Verificar si el usuario ya existe
    const userExists = await pool.query(
      'SELECT * FROM usuarios WHERE "Usuario" = $1',
      [Usuario.trim()]
    );

    if (userExists.rows.length > 0) {
      return res.status(400).json({ error: 'El usuario ya existe' });
    }

    // Hash de la contraseña
    const hash = await bcrypt.hash(contrasena.trim(), 10);

    // Crear nuevo usuario
    const newUser = await pool.query(
      'INSERT INTO usuarios ("Usuario", "contrasena") VALUES ($1, $2) RETURNING *',
      [Usuario.trim(), hash]
    );

    res.status(201).json({
      mensaje: 'Usuario registrado exitosamente',
      usuario: newUser.rows[0].Usuario
    });

  } catch (error) {
    console.error('Error en POST /registro:', error);
    res.status(500).json({ 
      error: 'Error al registrar usuario',
      detalle: process.env.NODE_ENV === 'development' ? error.message : null
    });
  }
});

// Endpoint de login
app.post('/login', async (req, res) => {
  try {
    const { Usuario, contrasena } = req.body;

    // Validación
    if (!Usuario?.trim() || !contrasena?.trim()) {
      return res.status(400).json({ error: 'Usuario y contraseña son requeridos' });
    }

    // Buscar usuario
    const result = await pool.query(
      'SELECT * FROM usuarios WHERE "Usuario" = $1',
      [Usuario.trim()]
    );
    
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const user = result.rows[0];
    const isHashed = user.contrasena?.startsWith('$2a$');

    // Verificar contraseña
    let isValid = false;
    if (isHashed) {
      isValid = await bcrypt.compare(contrasena.trim(), user.contrasena);
    } else {
      // Compatibilidad con contraseñas sin hash (solo para desarrollo)
      isValid = contrasena.trim() === user.contrasena;
    }

    if (!isValid) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    // Generar token JWT
    const token = jwt.sign(
      {
        id: user.id,
        Usuario: user.Usuario
      },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.json({
      mensaje: 'Login exitoso',
      token,
      Usuario: user.Usuario
    });

  } catch (error) {
    console.error('Error en POST /login:', error);
    res.status(500).json({ 
      error: 'Error interno del servidor',
      detalle: process.env.NODE_ENV === 'development' ? error.message : null
    });
  }
});

// Endpoint para hashear contraseñas existentes (ejecutar solo una vez)
app.get('/hash-passwords', async (req, res) => {
  try {
    const users = await pool.query('SELECT * FROM usuarios');
    let updated = 0;
    
    for (const user of users.rows) {
      if (!user.contrasena.startsWith('$2a$')) {
        const hash = await bcrypt.hash(user.contrasena, 10);
        await pool.query(
          'UPDATE usuarios SET "contrasena" = $1 WHERE "Usuario" = $2',
          [hash, user.id]
        );
        updated++;
      }
    }
    
    res.json({ message: `Contraseñas actualizadas: ${updated}` });
  } catch (error) {
    console.error('Error al hashear contraseñas:', error);
    res.status(500).json({ error: 'Error al procesar contraseñas' });
  }
});

// Endpoint del menú completo optimizado para Neon
app.get('/menu', async (req, res) => {
  try {
    const queries = [
      'tapas', 'hamburguesas', 'bocadillos', 'cervezas',
      'ensaladas', 'menu_infantil', 'platos_combinados',
      'postres', 'refrescos', 'sandwich'
    ].map(table => ({
      text: `SELECT * FROM ${table}`,
      rowMode: 'object'
    }));

    const results = await Promise.all(
      queries.map(q => pool.query(q).catch(e => ({ rows: [], error: e.message })))
    );

    const response = {};
    queries.forEach((q, i) => {
      response[q.text.split(' ')[2]] = results[i].rows;
    });

    res.json(response);
  } catch (error) {
    console.error('Error en GET /menu:', error);
    res.status(500).json({ error: 'Error al cargar el menú' });
  }
});// Endpoints básicos para cada categoría (ejemplo con cervezas)
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
// Middleware para manejar erroresS
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