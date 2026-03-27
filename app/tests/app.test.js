const request = require('supertest');
const app = require('../src/app');

describe('GET /', () => {
  test('retourne un message de bienvenue', async () => {
    const res = await request(app).get('/');
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe('Bienvenue sur notre API !');
    expect(res.body.version).toBe('1.0.0');
  });
});

describe('GET /health', () => {
  test('retourne le statut ok', async () => {
    const res = await request(app).get('/health');
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('ok');
  });
});

describe('POST /add', () => {
  test('additionne deux nombres', async () => {
    const res = await request(app).post('/add').send({ a: 3, b: 5 });
    expect(res.statusCode).toBe(200);
    expect(res.body.result).toBe(8);
  });

  test('retourne une erreur si les paramètres ne sont pas des nombres', async () => {
    const res = await request(app).post('/add').send({ a: 'foo', b: 5 });
    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBeDefined();
  });
});

describe('POST /multiply', () => {
  test('multiplie deux nombres', async () => {
    const res = await request(app).post('/multiply').send({ a: 4, b: 6 });
    expect(res.statusCode).toBe(200);
    expect(res.body.result).toBe(24);
  });

  test('retourne une erreur si les paramètres ne sont pas des nombres', async () => {
    const res = await request(app).post('/multiply').send({ a: 2, b: 'bar' });
    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBeDefined();
  });
});
