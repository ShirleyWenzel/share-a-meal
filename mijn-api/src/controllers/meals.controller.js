const db = require('../dao/mysql-db');

const mealController = {
  createMeal: (req, res, next) => {
    const cookId = req.userId;
    const { name, description, price, dateTime, maxAmountOfParticipants, imageUrl } = req.body;

    // Validatie
    if (!name || !description || !price || !dateTime || !maxAmountOfParticipants || !imageUrl) {
      return res.status(400).json({
        status: 400,
        message: 'Verplichte velden ontbreken.',
        data: {}
      });
    }

    db.getConnection((err, conn) => {
      if (err) return next({ status: 500, message: 'Databasefout' });

      const query = `
        INSERT INTO meal (name, description, price, dateTime, maxAmountOfParticipants, imageUrl, cookId)
        VALUES (?, ?, ?, ?, ?, ?, ?)`;

      conn.query(
        query,
        [name, description, price, dateTime, maxAmountOfParticipants, imageUrl, cookId],
        (err, results) => {
          conn.release();
          if (err) return next({ status: 500, message: 'Fout bij opslaan' });

          res.status(201).json({
            status: 201,
            message: 'Maaltijd succesvol aangemaakt',
            data: {
              id: results.insertId,
              name,
              description,
              price,
              dateTime,
              maxAmountOfParticipants,
              imageUrl,
              cookId
            }
          });
        }
      );
    });
  },
  updateMeal: (req, res, next) => {
  const mealId = parseInt(req.params.id);
  const cookIdFromToken = req.userId;
  const { name, price, maxAmountOfParticipants } = req.body;

  // Check of verplichte velden aanwezig zijn
  if (!name || !price || !maxAmountOfParticipants) {
    return res.status(400).json({
      status: 400,
      message: 'Verplichte velden ontbreken.',
      data: {}
    });
  }

  db.getConnection((err, conn) => {
    if (err) return next({ status: 500, message: 'Databasefout' });

    // Check of maaltijd bestaat en van deze gebruiker is
    conn.query('SELECT * FROM meal WHERE id = ?', [mealId], (err, results) => {
      if (err) {
        conn.release();
        return next({ status: 500, message: 'Queryfout' });
      }

      if (results.length === 0) {
        conn.release();
        return res.status(404).json({
          status: 404,
          message: 'Maaltijd niet gevonden.',
          data: {}
        });
      }

      const meal = results[0];
      if (meal.cookId !== cookIdFromToken) {
        conn.release();
        return res.status(403).json({
          status: 403,
          message: 'Je bent niet de eigenaar van deze maaltijd.',
          data: {}
        });
      }

      // Voer update uit
      const updateQuery = `
        UPDATE meal SET name = ?, price = ?, maxAmountOfParticipants = ?
        WHERE id = ?
      `;
      conn.query(updateQuery, [name, price, maxAmountOfParticipants, mealId], (err, result) => {
        conn.release();
        if (err) return next({ status: 500, message: 'Update mislukt' });

        res.status(200).json({
          status: 200,
          message: 'Maaltijd succesvol bijgewerkt',
          data: { id: mealId, name, price, maxAmountOfParticipants }
        });
      });
    });
  });
},

  getAllMeals: (req, res, next) => {
    db.getConnection((err, conn) => {
      if (err) return next({ status: 500, message: 'Databaseverbinding mislukt' });

      const query = `
        SELECT 
          m.id, m.name, m.description, m.price, m.dateTime, 
          m.maxAmountOfParticipants, m.imageUrl, 
          u.id AS cookId, u.firstName AS cookFirstName, u.lastName AS cookLastName
        FROM meal m
        LEFT JOIN user u ON m.cookId = u.id`;

      conn.query(query, (err, results) => {
        conn.release();
        if (err) return next({ status: 500, message: 'Databasequery mislukt' });

        const formattedMeals = results.map(r => ({
          id: r.id,
          name: r.name,
          description: r.description,
          price: r.price,
          dateTime: r.dateTime,
          maxAmountOfParticipants: r.maxAmountOfParticipants,
          imageUrl: r.imageUrl,
          cook: {
            id: r.cookId,
            firstName: r.cookFirstName,
            lastName: r.cookLastName
          }
        }));

        res.status(200).json({
          status: 200,
          message: 'Maaltijden opgehaald',
          data: formattedMeals
        });
      });
    });
  }

};

module.exports = mealController;
