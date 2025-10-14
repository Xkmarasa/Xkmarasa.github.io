const { Pool } = require('pg');

const pool = new Pool({
  connectionString: "postgresql://neondb_owner:npg_bxrt0dmus8NK@ep-yellow-brook-a9tp6293-pooler.gwc.azure.neon.tech/neondb?sslmode=require&channel_binding=require",
  ssl: {
    rejectUnauthorized: false, // Neon requiere SSL
  }, 
});

module.exports = pool;