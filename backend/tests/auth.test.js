const request = require('supertest');
const app = require('../src/index');
const { query, pool } = require('../src/database');

describe('Auth flows', () => {
  const testEmail = `test+${Date.now()}@example.com`;
  const testPassword = 'strongpassword123';
  let token = null;

  afterAll(async () => {
    // cleanup user
    try {
      await query('DELETE FROM users WHERE email = $1', [testEmail]);
    } catch (e) {
      // ignore
    }
    try {
      await pool.end();
    } catch (e) {
      // ignore
    }
  });

  test('POST /api/auth/register -> creates user and returns token', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: testEmail, password: testPassword, name: 'Test User' })
      .expect(201);

    expect(res.body.success).toBeTruthy();
    expect(res.body.data).toHaveProperty('token');
    token = res.body.data.token;
  });

  test('POST /api/auth/login -> returns token', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: testEmail, password: testPassword })
      .expect(200);

    expect(res.body.success).toBeTruthy();
    expect(res.body.data).toHaveProperty('token');
    token = res.body.data.token;
  });

  test('GET /api/auth/me -> requires token and returns user', async () => {
    await request(app).get('/api/auth/me').expect(401);

    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(res.body.success).toBeTruthy();
    expect(res.body.data).toHaveProperty('email', testEmail);
  });

  test('GET /api/protected -> protected route returns user when token provided', async () => {
    await request(app).get('/api/protected').expect(401);

    const res = await request(app)
      .get('/api/protected')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(res.body.success).toBeTruthy();
    expect(res.body.user).toBeDefined();
    expect(res.body.user).toHaveProperty('userId');
  });
});
