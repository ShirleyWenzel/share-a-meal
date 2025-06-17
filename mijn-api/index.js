const express = require('express');
const app = express();
const PORT = 3000;

// Middleware om JSON te kunnen lezen
app.use(express.json());

// Routes
app.get('/', (req, res) => {
  res.send('Welkom bij mijn API!');
});

// Start de server
app.listen(PORT, () => {
  console.log(`Server draait op http://localhost:${PORT}`);
});
