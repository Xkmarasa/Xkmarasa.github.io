require('dotenv').config();
const express = require('express');
const pool = require('./db.js');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Endpoint para todas las categorías (nombre más genérico)
app.get('/menu', async (req, res) => {
    try {
        const [
            tapas, 
            hamburguesa, 
            bocadillos, 
            cervezas, 
            ensaladas, 
            menu_infantil, 
            platos, 
            postres, 
            refrescos, 
            sandwich
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
            pool.query('SELECT * FROM sandwich') // Asegúrate que coincida con el nombre real en BD
        ]);
        
        res.json({
  bocadillos: bocadillos.rows,
  cervezas: cervezas.rows,
  ensaladas: ensaladas.rows,
  hamburguesa: hamburguesa.rows,
  menu_infantil: menu_infantil.rows,
  platos_combinados: platos_combinados.rows,
  postres: postres.rows,
  refrescos: refrescos.rows,
  sandwich: sandwich.rows,
  tapas: tapas.rows,
  
  
});
res.setHeader('Content-Type', 'application/json');
res.send(JSON.stringify(result.rows, null, 2));
    
    } catch (err) {
        console.error('Error en //menu:', err);
        res.status(500).json({ 
            error: 'Error al cargar el menú',
            details: err.message 
        });
    }
});
  
  app.get('/cervezas', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM cervezas');
        res.setHeader('Content-Type', 'application/json');
        res.send(JSON.stringify(result.rows, null, 2));
    } catch (err) {
        console.error('Error GET cervezas:', err);
        res.status(500).json({ error: err.message });
    }
});

app.post('/cervezas', async (req, res) => {
    try {
        const { nombre, precio } = req.body;  // Ajusta los campos a tu tabla real
        const result = await pool.query(
            'INSERT INTO cervezas (nombre, precio) VALUES ($1, $2) RETURNING *',
            [nombre, precio]
        );
        res.setHeader('Content-Type', 'application/json');
res.send(JSON.stringify(result.rows, null, 2));
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error('Error POST cervezas:', err);
        res.status(500).json({ error: err.message });
    }
});

// 🚀 2. Ensaladas
app.get('/ensaladas', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM ensaladas');
        res.setHeader('Content-Type', 'application/json');
        res.send(JSON.stringify(result.rows, null, 2));
    } catch (err) {
        console.error('Error GET ensaladas:', err);
        res.status(500).json({ error: err.message });
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
        res.status(500).json({ error: err.message });
    }
});

// 🚀 3. Hamburguesa
app.get('/hamburguesas', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM hamburguesas');
        res.setHeader('Content-Type', 'application/json');
        res.send(JSON.stringify(result.rows, null, 2));
    } catch (err) {
        console.error('Error GET hamburguesa:', err);
        res.status(500).json({ error: err.message });
    }
});

app.post('/hamburguesas', async (req, res) => {
    try {
        const { nombre, precio } = req.body;
        const result = await pool.query(
            'INSERT INTO hamburguesas (nombre, precio) VALUES ($1, $2) RETURNING *',
            [nombre, precio]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error('Error POST hamburguesa:', err);
        res.status(500).json({ error: err.message });
    }
});

// 🚀 4. Menú Infantil
app.get('/menu_infantil', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM menu_infantil');
        res.setHeader('Content-Type', 'application/json');
        res.send(JSON.stringify(result.rows, null, 2));
    } catch (err) {
        console.error('Error GET menu_infantil:', err);
        res.status(500).json({ error: err.message });
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
        res.status(500).json({ error: err.message });
    }
});

// 🚀 5. Platos
app.get('/platos_combinados', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM platos_combinados');
        res.setHeader('Content-Type', 'application/json');
        res.send(JSON.stringify(result.rows, null, 2));
    } catch (err) {
        console.error('Error GET platos:', err);
        res.status(500).json({ error: err.message });
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
        console.error('Error POST platos:', err);
        res.status(500).json({ error: err.message });
    }
});

// 🚀 6. Postres
app.get('/postres', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM postres');
        res.setHeader('Content-Type', 'application/json');
        res.send(JSON.stringify(result.rows, null, 2));
    } catch (err) {
        console.error('Error GET postres:', err);
        res.status(500).json({ error: err.message });
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
        res.status(500).json({ error: err.message });
    }
});

// 🚀 7. Refrescos
app.get('/refrescos', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM refrescos');
        res.setHeader('Content-Type', 'application/json');
        res.send(JSON.stringify(result.rows, null, 2));
    } catch (err) {
        console.error('Error GET refrescos:', err);
        res.status(500).json({ error: err.message });
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
        res.status(500).json({ error: err.message });
    }
});

// 🚀 8. Sandwich
app.get('/sandwich', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM sandwich');
        res.setHeader('Content-Type', 'application/json');
        res.send(JSON.stringify(result.rows, null, 2));
    } catch (err) {
        console.error('Error GET sandwich:', err);
        res.status(500).json({ error: err.message });
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
        res.status(500).json({ error: err.message });
    }
});

// 🚀 9. Tapas
app.get('/tapas', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM tapas');
        res.setHeader('Content-Type', 'application/json');
        res.send(JSON.stringify(result.rows, null, 2));
    } catch (err) {
        console.error('Error GET tapas:', err);
        res.status(500).json({ error: err.message });
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
        res.status(500).json({ error: err.message });
    }
});
    app.get('/bocadillos', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM bocadillos');
        res.setHeader('Content-Type', 'application/json');
        res.send(JSON.stringify(result.rows, null, 2));
    } catch (err) {
        console.error('Error GET bocadillos:', err);
        res.status(500).json({ error: err.message });
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
        res.status(500).json({ error: err.message });
    }
});

const PORT = process.env.PORT || 3000; // Render asigna su propio puerto via variable de entorno

app.listen(PORT, () => {
  console.log(`🚀 Servidor listo en el puerto ${PORT}`);
});