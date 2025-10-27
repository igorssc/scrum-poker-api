const express = require('express');

// Função simples para testar se a estrutura funciona
const app = express();

app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.all('*', (req, res) => {
  res.json({ 
    message: 'API is running', 
    method: req.method, 
    path: req.path,
    timestamp: new Date().toISOString()
  });
});

module.exports = app;