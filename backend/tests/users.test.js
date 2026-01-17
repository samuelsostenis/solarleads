const request = require('supertest');
const app = require('../src/index');
const { query, pool } = require('../src/database');

describe('Users management (admin)', () => {
  const adminEmail = `admin+test+${Date.now()}@example.com`;
  const adminPassword = 'AdminPass!23';
  const userEmail = `user+test+${Date.now()}@example.com`;
  const userPassword = 'UserPass!23';
  let adminToken = null;
  let createdUserId = null;

  afterAll(async () => {
    try { await query('DELETE FROM users WHERE email = $1', [adminEmail]); } catch(e){}
    try { await query('DELETE FROM users WHERE email = $1', [userEmail]); } catch(e){}
    try { await pool.end(); } catch(e){}
  });

  test('Register admin and user, then manage users', async () => {
    // register admin
    const r1 = await request(app).post('/api/auth/register').send({ email: adminEmail, password: adminPassword, name: 'Admin Test', role: 'admin' }).expect(201);
    expect(r1.body.success).toBeTruthy();
    adminToken = r1.body.data.token;

    // register regular user
    const r2 = await request(app).post('/api/auth/register').send({ email: userEmail, password: userPassword, name: 'User Test' }).expect(201);
    expect(r2.body.success).toBeTruthy();
    createdUserId = r2.body.data.user.id || r2.body.data.user?.id || null;

    // GET /api/users without token -> 401
    await request(app).get('/api/users').expect(401);

    // GET /api/users with admin token
    const listRes = await request(app).get('/api/users').set('Authorization', `Bearer ${adminToken}`).expect(200);
    expect(listRes.body.success).toBeTruthy();
    expect(Array.isArray(listRes.body.data)).toBeTruthy();

    // Update role of created user
    const upd = await request(app)
      .put(`/api/users/${createdUserId}/role`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ role: 'manager' })
      .expect(200);

    expect(upd.body.success).toBeTruthy();
    expect(upd.body.data).toHaveProperty('role', 'manager');

    // Delete the user
    const del = await request(app).delete(`/api/users/${createdUserId}`).set('Authorization', `Bearer ${adminToken}`).expect(200);
    expect(del.body.success).toBeTruthy();
  });
});
