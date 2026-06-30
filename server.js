require('dotenv').config();
const express = require('express');
const path = require('path');
const pool = require('./back/data/db.js');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Configurar EJS como motor de plantillas
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

const JWT_SECRET = 'clave-secreta-barcastello';

// ====================
// RUTAS DE PÁGINAS
// ====================

// Página de inicio
app.get('/', (req, res) => {
    res.render('inicio', { title: 'Bar Castelló - Inicio' });
});

// Página de carta estática
app.get('/carta', (req, res) => {
    res.render('carta', { title: 'Bar Castelló - Nuestra Carta' });
});

// Página de carta dinámica
app.get('/carta-dinamica', (req, res) => {
    res.render('cartaDinamica', { title: 'Bar Castelló - Carta Digital' });
});

// Página de administración
app.get('/admin', (req, res) => {
    res.render('admin', { title: 'Bar Castelló - Administración' });
});

// ====================
// API - AUTENTICACIÓN
// ====================

// Login
app.post('/api/login', async (req, res) => {
    try {
        const { Usuario, contrasena } = req.body;

        if (!Usuario?.trim() || !contrasena?.trim()) {
            return res.status(400).json({ error: 'Usuario y contraseña son requeridos' });
        }

        const result = await pool.query(
            'SELECT * FROM usuarios WHERE "Usuario" = $1',
            [Usuario.trim()]
        );
        
        if (result.rows.length === 0) {
            return res.status(401).json({ error: 'Credenciales inválidas' });
        }

        const user = result.rows[0];
        const isHashed = user.contrasena?.startsWith('$2a$');

        let isValid = false;
        if (isHashed) {
            isValid = await bcrypt.compare(contrasena.trim(), user.contrasena);
        } else {
            isValid = contrasena.trim() === user.contrasena;
        }

        if (!isValid) {
            return res.status(401).json({ error: 'Credenciales inválidas' });
        }

        const token = jwt.sign(
            { id: user.id, Usuario: user.Usuario },
            JWT_SECRET,
            { expiresIn: '1h' }
        );

        res.json({ mensaje: 'Login exitoso', token, Usuario: user.Usuario });

    } catch (error) {
        console.error('Error en POST /api/login:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// Registro
app.post('/api/registro', async (req, res) => {
    try {
        const { Usuario, contrasena } = req.body;

        if (!Usuario?.trim() || !contrasena?.trim()) {
            return res.status(400).json({ error: 'Usuario y contraseña son requeridos' });
        }

        const userExists = await pool.query(
            'SELECT * FROM usuarios WHERE "Usuario" = $1',
            [Usuario.trim()]
        );

        if (userExists.rows.length > 0) {
            return res.status(400).json({ error: 'El usuario ya existe' });
        }

        const hash = await bcrypt.hash(contrasena.trim(), 10);

        const newUser = await pool.query(
            'INSERT INTO usuarios ("Usuario", "contrasena") VALUES ($1, $2) RETURNING *',
            [Usuario.trim(), hash]
        );

        res.status(201).json({
            mensaje: 'Usuario registrado exitosamente',
            usuario: newUser.rows[0].Usuario
        });

    } catch (error) {
        console.error('Error en POST /api/registro:', error);
        res.status(500).json({ error: 'Error al registrar usuario' });
    }
});

// ====================
// API - MENÚ
// ====================

// Obtener menú completo
app.get('/api/menu', async (req, res) => {
    try {
        const tables = ['tapas', 'hamburguesas', 'bocadillos', 'cervezas', 'ensaladas', 'menu_infantil', 'platos_combinados', 'postres', 'refrescos', 'sandwich'];
        
        const results = await Promise.all(
            tables.map(table => 
                pool.query(`SELECT * FROM ${table}`).catch(e => ({ rows: [] }))
            )
        );

        const response = {};
        tables.forEach((table, i) => {
            response[table] = results[i].rows;
        });

        res.json(response);
    } catch (error) {
        console.error('Error en GET /api/menu:', error);
        res.status(500).json({ error: 'Error al cargar el menú' });
    }
});

// Función helper para crear rutas CRUD
function createCrudRoutes(table) {
    const capitalize = str => str.charAt(0).toUpperCase() + str.slice(1);
    
    // GET all
    app.get(`/api/${table}`, async (req, res) => {
        try {
            const result = await pool.query(`SELECT * FROM ${table} ORDER BY id`);
            res.json(result.rows);
        } catch (err) {
            console.error(`Error GET /api/${table}:`, err);
            res.status(500).json({ error: `Error al obtener ${table}` });
        }
    });

    // POST
    app.post(`/api/${table}`, async (req, res) => {
        try {
            const { name, price, description, image } = req.body;
            let query, params;
            
            if (description && image) {
                query = `INSERT INTO ${table} (name, price, description, image) VALUES ($1, $2, $3, $4) RETURNING *`;
                params = [name, price, description, image];
            } else if (image) {
                query = `INSERT INTO ${table} (name, price, image) VALUES ($1, $2, $3) RETURNING *`;
                params = [name, price, image];
            } else if (description) {
                query = `INSERT INTO ${table} (name, price, description) VALUES ($1, $2, $3) RETURNING *`;
                params = [name, price, description];
            } else {
                query = `INSERT INTO ${table} (name, price) VALUES ($1, $2) RETURNING *`;
                params = [name, price];
            }
            
            const result = await pool.query(query, params);
            res.status(201).json(result.rows[0]);
        } catch (err) {
            console.error(`Error POST /api/${table}:`, err);
            res.status(500).json({ error: `Error al crear ${table.slice(0, -1)}` });
        }
    });

    // PUT
    app.put(`/api/${table}/:id`, async (req, res) => {
        try {
            const { id } = req.params;
            const { name, price, description, image } = req.body;
            
            let query, params;
            if (description && image) {
                query = `UPDATE ${table} SET name = $1, price = $2, description = $3, image = $4 WHERE id = $5 RETURNING *`;
                params = [name, price, description, image, id];
            } else if (image) {
                query = `UPDATE ${table} SET name = $1, price = $2, image = $3 WHERE id = $4 RETURNING *`;
                params = [name, price, image, id];
            } else if (description) {
                query = `UPDATE ${table} SET name = $1, price = $2, description = $3 WHERE id = $4 RETURNING *`;
                params = [name, price, description, id];
            } else {
                query = `UPDATE ${table} SET name = $1, price = $2 WHERE id = $3 RETURNING *`;
                params = [name, price, id];
            }
            
            const result = await pool.query(query, params);
            
            if (result.rows.length === 0) {
                return res.status(404).json({ error: `${capitalize(table.slice(0, -1))} no encontrado` });
            }
            
            res.json(result.rows[0]);
        } catch (err) {
            console.error(`Error PUT /api/${table}:`, err);
            res.status(500).json({ error: `Error al editar ${table.slice(0, -1)}` });
        }
    });

    // DELETE
    app.delete(`/api/${table}/:id`, async (req, res) => {
        try {
            const { id } = req.params;
            const result = await pool.query(`DELETE FROM ${table} WHERE id = $1 RETURNING *`, [id]);
            
            if (result.rows.length === 0) {
                return res.status(404).json({ error: `${capitalize(table.slice(0, -1))} no encontrado` });
            }
            
            res.json({ mensaje: `${capitalize(table.slice(0, -1))} eliminado correctamente` });
        } catch (err) {
            console.error(`Error DELETE /api/${table}:`, err);
            res.status(500).json({ error: `Error al eliminar ${table.slice(0, -1)}` });
        }
    });
}

// Crear rutas CRUD para cada tabla
const tables = ['tapas', 'hamburguesas', 'bocadillos', 'cervezas', 'ensaladas', 'menu_infantil', 'platos_combinados', 'postres', 'refrescos', 'sandwich'];
tables.forEach(table => createCrudRoutes(table));

// ====================
// MIDDLEWARE DE ERRORES
// ====================

// Manejar errores
app.use((err, req, res, next) => {
    console.error('Error en la aplicación:', err);
    res.status(500).json({ error: 'Error interno del servidor' });
});

// Manejar rutas no encontradas
app.use((req, res) => {
    res.status(404).json({ error: 'Ruta no encontrada' });
});

// ====================
// INICIAR SERVIDOR
// ====================

app.listen(PORT, () => {
    console.log(`Servidor Bar Castelló corriendo en puerto ${PORT}`);
    console.log(`Visítanos: http://localhost:${PORT}`);
});

