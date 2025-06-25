const express = require('express');
const app = express();

console.log("✅ App geladen");
const db = require('./src/dao/mysql-db');



const PORT = process.env.PORT || 3000;

app.use(express.json());


const authRoutes = require('./src/routes/authentication.routes').routes;
app.use('/api', authRoutes);

const userRoutes = require('./src/routes/users.routes');
app.use('/api/user', userRoutes);

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


module.exports = app;