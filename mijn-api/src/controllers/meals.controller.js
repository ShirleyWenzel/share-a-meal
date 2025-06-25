const db = require('../dao/mysql-db');

const mealController = {
  createMeal: (req, res, next) => {
    const cookId = req.userId;
    const { name, description, price, dateTime, maxAmountOfParticipants, imageUrl } = req.body;

    console.log('👨‍🍳 createMeal - cookId:', cookId);
    console.log('📦 createMeal - gegevens:', req.body);

    if (!name || !description || !price || !dateTime || !maxAmountOfParticipants || !imageUrl) {
      console.warn('⚠️ createMeal - verplichte velden ontbreken');
      return res.status(400).json({
        status: 400,
        message: 'Verplichte velden ontbreken.',
        data: {}
      });
    }

    db.getConnection((err, conn) => {
      if (err) {
        console.error('❌ createMeal - fout bij verbinding:', err);
        return next({ status: 500, message: 'Databasefout' });
      }

      const query = `
        INSERT INTO meal (name, description, price, dateTime, maxAmountOfParticipants, imageUrl, cookId)
        VALUES (?, ?, ?, ?, ?, ?, ?)`;

      conn.query(query, [name, description, price, dateTime, maxAmountOfParticipants, imageUrl, cookId], (err, results) => {
        conn.release();

        if (err) {
          console.error('❌ createMeal - queryfout:', err);
          return next({ status: 500, message: 'Fout bij opslaan' });
        }

        console.log('✅ Maaltijd aangemaakt met ID:', results.insertId);
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
      });
    });
  },

  updateMeal: (req, res, next) => {
    const mealId = parseInt(req.params.id);
    const cookIdFromToken = req.userId;
    const { name, price, maxAmountOfParticipants } = req.body;

    console.log('🛠️ updateMeal - mealId:', mealId, '| userId:', cookIdFromToken);
    console.log('📦 updateMeal - gegevens:', req.body);

    if (!name || !price || !maxAmountOfParticipants) {
      return res.status(400).json({
        status: 400,
        message: 'Verplichte velden ontbreken.',
        data: {}
      });
    }

    db.getConnection((err, conn) => {
      if (err) {
        console.error('❌ updateMeal - db fout:', err);
        return next({ status: 500, message: 'Databasefout' });
      }

      conn.query('SELECT * FROM meal WHERE id = ?', [mealId], (err, results) => {
        if (err) {
          conn.release();
          console.error('❌ updateMeal - SELECT fout:', err);
          return next({ status: 500, message: 'Queryfout' });
        }

        if (results.length === 0) {
          conn.release();
          console.warn('⚠️ updateMeal - maaltijd niet gevonden');
          return res.status(404).json({
            status: 404,
            message: 'Maaltijd niet gevonden.',
            data: {}
          });
        }

        const meal = results[0];
        console.log('🔎 updateMeal - gevonden maaltijd:', meal);

        if (meal.cookId !== cookIdFromToken) {
          conn.release();
          console.warn('⛔ updateMeal - geen eigenaar');
          return res.status(403).json({
            status: 403,
            message: 'Je bent niet de eigenaar van deze maaltijd.',
            data: {}
          });
        }

        const updateQuery = `
          UPDATE meal SET name = ?, price = ?, maxAmountOfParticipants = ?
          WHERE id = ?`;

        conn.query(updateQuery, [name, price, maxAmountOfParticipants, mealId], (err) => {
          conn.release();

          if (err) {
            console.error('❌ updateMeal - update fout:', err);
            return next({ status: 500, message: 'Update mislukt' });
          }

          console.log('✅ Maaltijd geüpdatet:', mealId);
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
      if (err) {
        console.error('❌ getAllMeals - DB fout:', err);
        return next({ status: 500, message: 'Databaseverbinding mislukt' });
      }

      const query = `
        SELECT m.*, u.id AS cookId, u.firstName AS cookFirstName, u.lastName AS cookLastName
        FROM meal m LEFT JOIN user u ON m.cookId = u.id`;

      conn.query(query, (err, results) => {
        conn.release();

        if (err) {
          console.error('❌ getAllMeals - query fout:', err);
          return next({ status: 500, message: 'Databasequery mislukt' });
        }

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

        console.log('🍽️ Aantal maaltijden gevonden:', formattedMeals.length);
        res.status(200).json({
          status: 200,
          message: 'Maaltijden opgehaald',
          data: formattedMeals
        });
      });
    });
  },

  getMealById: (req, res, next) => {
    const mealId = parseInt(req.params.id);
    console.log('🔍 getMealById - mealId:', mealId);

    db.getConnection((err, conn) => {
      if (err) {
        console.error('❌ getMealById - DB fout:', err);
        return next({ status: 500, message: 'Databasefout' });
      }

      const query = `
        SELECT m.*, u.firstName, u.lastName FROM meal m
        LEFT JOIN user u ON m.cookId = u.id
        WHERE m.id = ?`;

      conn.query(query, [mealId], (err, results) => {
        conn.release();

        if (err) {
          console.error('❌ getMealById - query fout:', err);
          return next({ status: 500, message: 'Queryfout' });
        }

        if (results.length === 0) {
          console.warn('⚠️ getMealById - maaltijd niet gevonden');
          return res.status(404).json({
            status: 404,
            message: 'Maaltijd niet gevonden',
            data: {}
          });
        }

        const m = results[0];
        res.status(200).json({
          status: 200,
          message: 'Maaltijddetails opgehaald',
          data: {
            id: m.id,
            name: m.name,
            description: m.description,
            price: m.price,
            dateTime: m.dateTime,
            maxAmountOfParticipants: m.maxAmountOfParticipants,
            imageUrl: m.imageUrl,
            cook: {
              id: m.cookId,
              firstName: m.firstName,
              lastName: m.lastName
            }
          }
        });
      });
    });
  },

  deleteMeal: (req, res, next) => {
    const mealId = parseInt(req.params.id);
    const userId = req.userId;

    console.log('🗑️ deleteMeal - mealId:', mealId, '| userId:', userId);

    db.getConnection((err, conn) => {
      if (err) {
        console.error('❌ deleteMeal - DB fout:', err);
        return next({ status: 500, message: 'Databaseverbinding mislukt' });
      }

      conn.query('SELECT * FROM meal WHERE id = ?', [mealId], (err, results) => {
        if (err) {
          conn.release();
          console.error('❌ deleteMeal - SELECT fout:', err);
          return next({ status: 500, message: 'Queryfout bij zoeken maaltijd' });
        }

        if (results.length === 0) {
          conn.release();
          return res.status(404).json({
            status: 404,
            message: 'Maaltijd niet gevonden',
            data: {}
          });
        }

        const meal = results[0];

        if (meal.cookId !== userId) {
          conn.release();
          console.warn('⛔ deleteMeal - geen eigenaar');
          return res.status(403).json({
            status: 403,
            message: 'Je bent niet de eigenaar van deze maaltijd',
            data: {}
          });
        }

        conn.query('DELETE FROM meal_participants_user WHERE mealId = ?', [mealId], (err) => {
          if (err) {
            conn.release();
            console.error('❌ deleteMeal - fout bij verwijderen aanmeldingen:', err);
            return next({ status: 500, message: 'Fout bij verwijderen aanmeldingen' });
          }

          conn.query('DELETE FROM meal WHERE id = ?', [mealId], (err) => {
            conn.release();
            if (err) {
              console.error('❌ deleteMeal - fout bij verwijderen maaltijd:', err);
              return next({ status: 500, message: 'Fout bij verwijderen maaltijd' });
            }

            console.log('✅ Maaltijd verwijderd:', mealId);
            res.status(200).json({
              status: 200,
              message: 'Maaltijd en aanmeldingen succesvol verwijderd',
              data: {
                deleted: mealId
              }
            });
          });
        });
      });
    });
  }
};

module.exports = mealController;
