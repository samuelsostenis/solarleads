const request = require('supertest');
const app = require('../src/index');
const { query, pool } = require('../src/database');

describe('Messages & Campaigns (validation & roles)', () => {
  const userEmail = `user+${Date.now()}@example.com`;
  const adminEmail = `admin+${Date.now()}@example.com`;
  const password = 'strongpassword123';
  let userToken = null;
  let adminToken = null;

  afterAll(async () => {
    try {
      await query('DELETE FROM messages WHERE message LIKE $1', ['%test-message%']);
      await query('DELETE FROM campaigns WHERE name LIKE $1', ['%Test Campaign%']);
      await query('DELETE FROM users WHERE email = $1 OR email = $2', [userEmail, adminEmail]);
    } catch (e) {
      // ignore
    }
    try {
      await pool.end();
    } catch (e) {
      // ignore
    }
  });

  test('Register user and admin', async () => {
    const resUser = await request(app).post('/api/auth/register').send({ email: userEmail, password, name: 'User' }).expect(201);
    expect(resUser.body.success).toBeTruthy();
    userToken = resUser.body.data.token;

    const resAdmin = await request(app).post('/api/auth/register').send({ email: adminEmail, password, name: 'Admin', role: 'admin' }).expect(201);
    expect(resAdmin.body.success).toBeTruthy();
    adminToken = resAdmin.body.data.token;
  });

  test('POST /api/messages without token -> 401', async () => {
    await request(app).post('/api/messages').send({}).expect(401);
  });

  test('POST /api/messages with invalid body -> 400', async () => {
    await request(app).post('/api/messages').set('Authorization', `Bearer ${userToken}`).send({ message: 'no lead id', direction: 'in' }).expect(400);
  });

  test('POST /api/messages with valid body -> 201', async () => {
    // create a dummy lead to reference
    const lead = await query(`INSERT INTO leads (phone, name, status) VALUES ($1,$2,$3) RETURNING id`, ['+5511999999999', 'Lead Test', 'new']);
    const leadId = lead.rows[0].id;

    const res = await request(app)
      .post('/api/messages')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ lead_id: leadId, message: 'test-message', direction: 'in' })
      .expect(201);

    expect(res.body.success).toBeTruthy();
  });

  test('POST /api/campaigns: user cannot create -> 403', async () => {
    await request(app)
      .post('/api/campaigns')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ name: 'Test Campaign', message_template: 'Hello' })
      .expect(403);
  });

  test('POST /api/campaigns: admin can create -> 201', async () => {
    const res = await request(app)
      .post('/api/campaigns')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'Test Campaign', message_template: 'Hello', status: 'active' })
      .expect(201);

    expect(res.body.success).toBeTruthy();
  });
});
