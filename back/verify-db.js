const pool = require('./data/db.js');

async function verifyDatabase() {
    try {
        console.log('🔍 Verificando base de datos...');
        
        // Verificar conexión
        const connectionTest = await pool.query('SELECT 1');
        console.log('✅ Conexión a base de datos exitosa');
        
        // Verificar estructura de la tabla
        const tableInfo = await pool.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'news' 
            ORDER BY ordinal_position
        `);
        console.log('📋 Estructura de la tabla news:');
        tableInfo.rows.forEach(row => {
            console.log(`  - ${row.column_name}: ${row.data_type}`);
        });
        
        // Contar noticias existentes
        const countResult = await pool.query('SELECT COUNT(*) as count FROM news');
        console.log(`📊 Total de noticias en la base de datos: ${countResult.rows[0].count}`);
        
        // Mostrar las últimas 3 noticias
        const recentNews = await pool.query('SELECT id, title, date FROM news ORDER BY date DESC LIMIT 3');
        if (recentNews.rows.length > 0) {
            console.log('📰 Últimas noticias:');
            recentNews.rows.forEach((row, i) => {
                const date = new Date(parseInt(row.date)).toLocaleString();
                console.log(`  ${i+1}. ${row.title} (${date})`);
            });
        } else {
            console.log('📭 No hay noticias en la base de datos');
        }
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await pool.end();
    }
}

verifyDatabase();
