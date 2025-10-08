const pool = require('./data/db.js');

async function testDatabase() {
    try {
        console.log('🔍 Testing database connection...');
        
        // Test connection
        const connectionTest = await pool.query('SELECT 1');
        console.log('✅ Database connection successful');
        
        // Test insert
        const testId = 'test_' + Date.now();
        const result = await pool.query(
            'INSERT INTO "new" (id, title, description, link, image, date) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
            [testId, 'Test News', 'This is a test news', 'https://example.com', 'https://example.com/image.jpg', Date.now().toString()]
        );
        
        console.log('✅ Test insert successful:', result.rows[0]);
        
        // Test select
        const selectResult = await pool.query('SELECT * FROM "new" WHERE id = $1', [testId]);
        console.log('✅ Test select successful:', selectResult.rows[0]);
        
        // Clean up test data
        await pool.query('DELETE FROM "new" WHERE id = $1', [testId]);
        console.log('✅ Test data cleaned up');
        
    } catch (error) {
        console.error('❌ Database test failed:', error.message);
    } finally {
        await pool.end();
    }
}

testDatabase();
