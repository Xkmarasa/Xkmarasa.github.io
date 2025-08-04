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
    const { name, price } = req.body;
    const result = await pool.query(
      'INSERT INTO cervezas (name, price) VALUES ($1, $2) RETURNING *',
      [name, price]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error POST cervezas:', err);
    res.status(500).json({ error: 'Error al crear cerveza' });
  }
});

app.post('/tapas', async (req, res) => {
  try {
    const { name, price } = req.body;
    const result = await pool.query(
      'INSERT INTO tapas (name, price) VALUES ($1, $2) RETURNING *',
      [name, price]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error POST tapas:', err);
    res.status(500).json({ error: 'Error al crear tapa' });
  }
});
app.post('/bocadillos', async (req, res) => {
  try {
    const { name, price } = req.body;
    const result = await pool.query(
      'INSERT INTO bocadillos (name, price) VALUES ($1, $2) RETURNING *',
      [name, price]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error POST bocadillos:', err);
    res.status(500).json({ error: 'Error al crear bocadillo' });
  }
});
app.post('/ensaladas', async (req, res) => {
  try {
    const { name, price, description, image } = req.body;
    const result = await pool.query(
      'INSERT INTO ensaladas (name, price, description, image) VALUES ($1, $2, $3, $4) RETURNING *',
      [name, price, description, image]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error POST ensaladas:', err);
    res.status(500).json({ error: 'Error al crear ensalada' });
  }
});
app.post('/menu_infantil', async (req, res) => {
  try {
    const { name, price, image } = req.body;
    const result = await pool.query(
      'INSERT INTO menu_infantil (name, price, image) VALUES ($1, $2, $3) RETURNING *',
      [name, price, image]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error POST menu_infantil:', err);
    res.status(500).json({ error: 'Error al crear menú infantil' });
  }
});
app.post('/platos_combinados', async (req, res) => {
  try {
    const { name, price, image } = req.body;
    const result = await pool.query(
      'INSERT INTO platos_combinados (name, price, image) VALUES ($1, $2, $3) RETURNING *',
      [name, price, image]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error POST platos_combinados:', err);
    res.status(500).json({ error: 'Error al crear plato combinado' });
  }
});
app.post('/postres', async (req, res) => {
  try {
    const { name, price, image } = req.body;
    const result = await pool.query(
      'INSERT INTO postres (name, price, image) VALUES ($1, $2, $3) RETURNING *',
      [name, price, image]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error POST postres:', err);
    res.status(500).json({ error: 'Error al crear postre' });
  }
});
app.post('/refrescos', async (req, res) => {
  try {
    const { name, price } = req.body;
    const result = await pool.query(
      'INSERT INTO refrescos (name, price) VALUES ($1, $2) RETURNING *',
      [name, price]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error POST refrescos:', err);
    res.status(500).json({ error: 'Error al crear refresco' });
  }
});
app.post('/sandwich', async (req, res) => {
  try {
    const { name, price, image } = req.body;
    const result = await pool.query(
      'INSERT INTO sandwich (name, price, image) VALUES ($1, $2, $3) RETURNING *',
      [name, price, image]
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
// ==== CERVEZAS ====
app.put('/cervezas/:id', async (req, res) => {
  const { id } = req.params;
  const { name, price } = req.body;

  try {
    const result = await pool.query(
      'UPDATE cervezas SET name = $1, price = $2 WHERE id = $3 RETURNING *',
      [name, price, id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Cerveza no encontrada' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error PUT cervezas:', err);
    res.status(500).json({ error: 'Error al editar cerveza' });
  }
});

app.delete('/cervezas/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM cervezas WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Cerveza no encontrada' });
    res.json({ mensaje: 'Cerveza eliminada correctamente' });
  } catch (err) {
    console.error('Error DELETE cervezas:', err);
    res.status(500).json({ error: 'Error al eliminar cerveza' });
  }
});

// ==== TAPAS ====
app.put('/tapas/:id', async (req, res) => {
  const { id } = req.params;
  const { name, price } = req.body;
  try {
    const result = await pool.query(
      'UPDATE tapas SET name = $1, price = $2 WHERE id = $3 RETURNING *',
      [name, price, id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Tapa no encontrada' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error PUT tapas:', err);
    res.status(500).json({ error: 'Error al editar tapa' });
  }
});

app.delete('/tapas/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM tapas WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Tapa no encontrada' });
    res.json({ mensaje: 'Tapa eliminada correctamente' });
  } catch (err) {
    console.error('Error DELETE tapas:', err);
    res.status(500).json({ error: 'Error al eliminar tapa' });
  }
});

// ==== BOCADILLOS ====
app.put('/bocadillos/:id', async (req, res) => {
  const { id } = req.params;
  const { name, price } = req.body;
  try {
    const result = await pool.query(
      'UPDATE bocadillos SET name = $1, price = $2 WHERE id = $3 RETURNING *',
      [name, price, id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Bocadillo no encontrado' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error PUT bocadillos:', err);
    res.status(500).json({ error: 'Error al editar bocadillo' });
  }
});

app.delete('/bocadillos/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM bocadillos WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Bocadillo no encontrado' });
    res.json({ mensaje: 'Bocadillo eliminado correctamente' });
  } catch (err) {
    console.error('Error DELETE bocadillos:', err);
    res.status(500).json({ error: 'Error al eliminar bocadillo' });
  }
});

// ==== ENSALADAS ====
app.put('/ensaladas/:id', async (req, res) => {
  const { id } = req.params;
  const { name, price, description, image } = req.body;
  try {
    const result = await pool.query(
      'UPDATE ensaladas SET name = $1, price = $2, description = $3, image = $4 WHERE id = $5 RETURNING *',
      [name, price, description, image, id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Ensalada no encontrada' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error PUT ensaladas:', err);
    res.status(500).json({ error: 'Error al editar ensalada' });
  }
});

app.delete('/ensaladas/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM ensaladas WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Ensalada no encontrada' });
    res.json({ mensaje: 'Ensalada eliminada correctamente' });
  } catch (err) {
    console.error('Error DELETE ensaladas:', err);
    res.status(500).json({ error: 'Error al eliminar ensalada' });
  }
});

// ==== MENU INFANTIL ====
app.put('/menu_infantil/:id', async (req, res) => {
  const { id } = req.params;
  const { name, price, image } = req.body;
  try {
    const result = await pool.query(
      'UPDATE menu_infantil SET name = $1, price = $2, image = $3 WHERE id = $4 RETURNING *',
      [name, price, image, id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Menú infantil no encontrado' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error PUT menu_infantil:', err);
    res.status(500).json({ error: 'Error al editar menú infantil' });
  }
});

app.delete('/menu_infantil/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM menu_infantil WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Menú infantil no encontrado' });
    res.json({ mensaje: 'Menú infantil eliminado correctamente' });
  } catch (err) {
    console.error('Error DELETE menu_infantil:', err);
    res.status(500).json({ error: 'Error al eliminar menú infantil' });
  }
});

// ==== PLATOS COMBINADOS ====
app.put('/platos_combinados/:id', async (req, res) => {
  const { id } = req.params;
  const { name, price, image } = req.body;
  try {
    const result = await pool.query(
      'UPDATE platos_combinados SET name = $1, price = $2, image = $3 WHERE id = $4 RETURNING *',
      [name, price, image, id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Plato combinado no encontrado' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error PUT platos_combinados:', err);
    res.status(500).json({ error: 'Error al editar plato combinado' });
  }
});

app.delete('/platos_combinados/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM platos_combinados WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Plato combinado no encontrado' });
    res.json({ mensaje: 'Plato combinado eliminado correctamente' });
  } catch (err) {
    console.error('Error DELETE platos_combinados:', err);
    res.status(500).json({ error: 'Error al eliminar plato combinado' });
  }
});

// ==== POSTRES ====
app.put('/postres/:id', async (req, res) => {
  const { id } = req.params;
  const { name, price, image } = req.body;
  try {
    const result = await pool.query(
      'UPDATE postres SET name = $1, price = $2, image = $3 WHERE id = $4 RETURNING *',
      [name, price, image, id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Postre no encontrado' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error PUT postres:', err);
    res.status(500).json({ error: 'Error al editar postre' });
  }
});

app.delete('/postres/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM postres WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Postre no encontrado' });
    res.json({ mensaje: 'Postre eliminado correctamente' });
  } catch (err) {
    console.error('Error DELETE postres:', err);
    res.status(500).json({ error: 'Error al eliminar postre' });
  }
});

// ==== REFRESCOS ====
app.put('/refrescos/:id', async (req, res) => {
  const { id } = req.params;
  const { name, price } = req.body;
  try {
    const result = await pool.query(
      'UPDATE refrescos SET name = $1, price = $2 WHERE id = $3 RETURNING *',
      [name, price, id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Refresco no encontrado' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error PUT refrescos:', err);
    res.status(500).json({ error: 'Error al editar refresco' });
  }
});

app.delete('/refrescos/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM refrescos WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Refresco no encontrado' });
    res.json({ mensaje: 'Refresco eliminado correctamente' });
  } catch (err) {
    console.error('Error DELETE refrescos:', err);
    res.status(500).json({ error: 'Error al eliminar refresco' });
  }
});

// ==== SANDWICH ====
app.put('/sandwich/:id', async (req, res) => {
  const { id } = req.params;
  const { name, price, image } = req.body;
  try {
    const result = await pool.query(
      'UPDATE sandwich SET name = $1, price = $2, image = $3 WHERE id = $4 RETURNING *',
      [name, price, image, id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Sandwich no encontrado' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error PUT sandwich:', err);
    res.status(500).json({ error: 'Error al editar sandwich' });
  }
});

app.delete('/sandwich/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM sandwich WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Sandwich no encontrado' });
    res.json({ mensaje: 'Sandwich eliminado correctamente' });
  } catch (err) {
    console.error('Error DELETE sandwich:', err);
    res.status(500).json({ error: 'Error al eliminar sandwich' });
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