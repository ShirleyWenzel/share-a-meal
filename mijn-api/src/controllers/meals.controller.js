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
  }
};

module.exports = mealController;
