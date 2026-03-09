const { Pool } = require('pg');

// =============================================================================
// ⚠️ IMPORTANTE: NO BORRAR - Connection String anterior (Neon US - nuevo)
// =============================================================================
// const pool = new Pool({
//   connectionString: "postgresql://neondb_owner:npg_oiAv5KWEBXO0@ep-quiet-wind-abn3d35x-pooler.eu-west-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require",
//   ssl: {
//     rejectUnauthorized: false,
//     searchPath: ['public', 'neondb']
//   },
// });
// =============================================================================
// ⚠️ IMPORTANTE: NO BORRAR - Connection String anterior (Neon EU - tiene los datos)
// =============================================================================
const pool = new Pool({
  connectionString: "postgresql://neondb_owner:npg_7Hzmx4YIwdin@ep-orange-heart-adbyxiqq-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require",
  ssl: {
    rejectUnauthorized: false,
    searchPath: ['public', 'neondb']
  },
});

module.exports = pool;
