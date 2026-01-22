const express = require('express');
const app = express();
const port = 3000;
const version = "0.0.1"

// Middleware to parse JSON
app.use(express.json());

// Simple API endpoint
app.get('/api/version', (req, res) => {
  res.json({ version: version });
});

app.listen(port, () => {
  console.log(`API listening on http://localhost:${port}`);
});
