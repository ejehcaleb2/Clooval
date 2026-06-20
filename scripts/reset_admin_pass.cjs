const { Pool } = require('pg');
require('dotenv').config();
(async ()=>{
  const DATABASE_URL = process.env.DATABASE_URL;
  if (!DATABASE_URL) return console.error('DATABASE_URL missing in env');
  const pool = new Pool({ connectionString: DATABASE_URL });
  try{
    await pool.query("UPDATE users SET password_hash = $1 WHERE LOWER(email) = $2", ['adminpass', 'admin@cloova.com']);
    console.log('Password updated');
  }catch(e){
    console.error('Update failed', e.message || e);
  }finally{
    await pool.end();
  }
})();
