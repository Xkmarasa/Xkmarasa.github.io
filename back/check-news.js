const pool = require('./data/db.js');

async function checkNews() {
    try {
        console.log('🔍 Checking news in database...');
        const result = await pool.query('SELECT * FROM news ORDER BY date DESC LIMIT 5');
        
        if (result.rows.length === 0) {
            console.log('📭 No news found in database');
        } else {
            console.log(`📰 Found ${result.rows.length} news items:`);
            result.rows.forEach((row, i) => {
                console.log(`${i+1}. ${row.title} (${new Date(parseInt(row.date)).toLocaleString()})`);
            });
        }
    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await pool.end();
    }
}

checkNews();
