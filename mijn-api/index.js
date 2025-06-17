const express = require('express');
const app = express();
const db = require('./db');

const PORT = 3000;
app.use(express.json());

app.get('/meals', async (req, res) => {
  console.log('✅ /meals wordt aangeroepen');
  try {
    const [meals] = await db.query('SELECT * FROM meal');
    res.json(meals);
  } catch (err) {
    console.error('❌ Databasefout:', err);
    res.status(500).send('Databasefout');
  }
});

app.listen(PORT, () => {
  console.log(`✅ Server draait op http://localhost:${PORT}`);
});
