const db = require('./src/database');

(async () => {
  try {
    const m = await db.query('SELECT count(*) AS cnt FROM migrations');
    console.log('migrations count:', m.rows[0].cnt);

    const u = await db.query(
      'SELECT id, email, role FROM users WHERE email = $1',
      ['admin@solarleads.local']
    );
    console.log('admin user:', u.rows.length ? u.rows[0] : 'não encontrado');
  } catch (err) {
    console.error('DB query error:', err.message || err);
    process.exitCode = 1;
  } finally {
    if (db && typeof db.end === 'function') {
      try { await db.end(); } catch (_) {}
    } else if (db && db.pool && typeof db.pool.end === 'function') {
      try { await db.pool.end(); } catch (_) {}
    }
    process.exit();
  }
})();