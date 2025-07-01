const express = require('express');
const app = express();

app.use(express.json());


const authRoutes = require('./src/routes/authentication.routes').routes;
app.use('/api', authRoutes);

const userRoutes = require('./src/routes/users.routes');
app.use('/api/user', userRoutes);

const mealRoutes = require('./src/routes/meals.routes');
app.use('/api/meal', mealRoutes);

const { validateToken } = require('./src/routes/authentication.routes');

app.get('/api/user/info', validateToken, (req, res) => {
  res.status(200).json({
    message: 'Toegang toegestaan!',
    userId: req.userId
  });
});

app.use((err, req, res, next) => {
  if (err.status) {
    return res.status(err.status).json({
      status: err.status,
      message: err.message,
      data: err.data || {}
    });
  }
  res.status(500).json({
    status: 500,
    message: 'Onbekende serverfout',
    data: {}
  });
});


module.exports = app;