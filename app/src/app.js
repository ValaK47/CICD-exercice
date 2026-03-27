const express = require('express');
const app = express();

app.use(express.json());

// Route principale
app.get('/', (req, res) => {
  res.json({ message: 'Bienvenue sur notre API !', version: '1.0.0' });
});

// Calculatrice simple
app.post('/add', (req, res) => {
  const { a, b } = req.body;
  if (typeof a !== 'number' || typeof b !== 'number') {
    return res.status(400).json({ error: 'Les paramètres a et b doivent être des nombres' });
  }
  res.json({ result: a + b });
});

app.post('/multiply', (req, res) => {
  const { a, b } = req.body;
  if (typeof a !== 'number' || typeof b !== 'number') {
    return res.status(400).json({ error: 'Les paramètres a et b doivent être des nombres' });
  }
  res.json({ result: a * b });
});

// Route de santé (utilisée par les pipelines CI/CD)
app.get('/health', (req, res) => {
  res.json({ status: 'ok', uptime: process.uptime() });
});

module.exports = app;
