const { Pool } = require('pg');

const pool = new Pool({
  connectionString: "postgresql://neondb_owner:npg_oiAv5KWEBXO0@ep-quiet-wind-abn3d35x-pooler.eu-west-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require",
  ssl: {
    rejectUnauthorized: false, // Neon requiere SSL
    searchPath: ['public', 'neondb']
  }, 
});

module.exports = pool;