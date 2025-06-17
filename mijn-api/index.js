const express = require('express');
const app = express();
const db = require('./src/dao/mysql-db');

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

const authRoutes = require('./src/routes/authentication.routes').routes;
app.use('/api/auth', authRoutes);

const userRoutes = require('./src/routes/users.routes');
app.use('/api/users', userRoutes);

const mealRoutes = require('./src/routes/meals.routes');
app.use('/api/meals', mealRoutes);

const { validateToken } = require('./src/routes/authentication.routes');

app.get('/api/user/info', validateToken, (req, res) => {
  res.status(200).json({
    message: 'Toegang toegestaan!',
    userId: req.userId
  });
});

app.use((err, req, res, next) => {
  res.status(err.status || 500).json({
    status: err.status || 500,
    message: err.message || 'Interne serverfout',
    data: err.data || {}
  });
});

app.listen(PORT, () => {
  console.log(`✅ Server draait op http://localhost:${PORT}`);
});
