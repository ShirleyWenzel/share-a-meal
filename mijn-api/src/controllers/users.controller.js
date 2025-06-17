const db = require('../dao/mysql-db');

const userController = {
  getAllUsers: (req, res, next) => {
    const filters = [];
    const values = [];

    if (req.query.isActive !== undefined) {
      filters.push('isActive = ?');
      values.push(Number(req.query.isActive));
    }

    if (req.query.firstName) {
      filters.push('firstName LIKE ?');
      values.push(`%${req.query.firstName}%`);
    }

    if (req.query.emailAdress) {
      filters.push('emailAdress LIKE ?');
      values.push(`%${req.query.emailAdress}%`);
    }

    const whereClause = filters.length ? `WHERE ${filters.join(' AND ')}` : '';

    db.getConnection((err, conn) => {
      if (err) return next({ status: 500, message: 'Databaseverbinding mislukt' });

      const query = `SELECT id, firstName, lastName, emailAdress, isActive FROM user ${whereClause}`;
      conn.query(query, values, (err, results) => {
        conn.release();

        if (err) return next({ status: 500, message: 'Databasequery mislukt' });

        res.status(200).json({
          status: 200,
          message: 'Gebruikers succesvol opgehaald',
          data: results
        });
      });
    });
  },

  getOwnProfile: (req, res, next) => {
    const userId = req.userId;

    db.getConnection((err, conn) => {
      if (err) return next({ status: 500, message: 'Databaseverbinding mislukt' });

      const query = `
        SELECT u.id, u.firstName, u.lastName, u.emailAdress, u.isActive,
               m.id AS mealId, m.name AS mealName, m.dateTime
        FROM user u
        LEFT JOIN meal m ON u.id = m.cookId AND m.dateTime >= NOW()
        WHERE u.id = ?`;

      conn.query(query, [userId], (err, results) => {
        conn.release();
        if (err) return next({ status: 500, message: 'Queryfout' });
        if (results.length === 0) return next({ status: 404, message: 'Gebruiker niet gevonden' });

        const { id, firstName, lastName, emailAdress, isActive } = results[0];
        const meals = results.filter(r => r.mealId).map(r => ({
          id: r.mealId,
          name: r.mealName,
          dateTime: r.dateTime
        }));

        res.status(200).json({
          status: 200,
          message: 'Profiel opgehaald',
          data: { id, firstName, lastName, emailAdress, isActive, futureMeals: meals }
        });
      });
    });
  },

  getUserProfileById: (req, res, next) => {
    const userId = req.params.id;

    db.getConnection((err, conn) => {
      if (err) return next({ status: 500, message: 'Databasefout' });

      conn.query(`SELECT id, firstName, lastName, emailAdress, isActive FROM user WHERE id = ?`, [userId], (err, results) => {
        if (err) {
          conn.release();
          return next({ status: 500, message: 'Queryfout' });
        }

        if (results.length === 0) {
          conn.release();
          return next({ status: 404, message: 'Gebruiker niet gevonden' });
        }

        const user = results[0];

        conn.query(`SELECT id, name, dateTime FROM meal WHERE cookId = ? AND dateTime > NOW()`, [userId], (err, meals) => {
          conn.release();
          if (err) return next({ status: 500, message: 'Fout bij ophalen maaltijden' });

          res.status(200).json({
            status: 200,
            message: 'Gebruiker en maaltijden opgehaald',
            data: { ...user, futureMeals: meals }
          });
        });
      });
    });
  },

updateUser: (req, res, next) => {
  try {
    const userIdFromParams = parseInt(req.params.id);
    const userIdFromToken = req.userId;

    if (userIdFromParams !== userIdFromToken) {
      return res.status(403).json({
        status: 403,
        message: 'Je mag alleen je eigen gegevens wijzigen.',
        data: {}
      });
    }

    const { emailAdress, phoneNumber } = req.body;
    if (!emailAdress || !phoneNumber) {
      return res.status(400).json({
        status: 400,
        message: 'Verplichte velden ontbreken of zijn ongeldig.',
        data: {}
      });
    }

    db.getConnection((err, conn) => {
      if (err) {
        return next({
          status: 500,
          message: err.message || 'Databasefout',
          data: {}
        });
      }

      conn.query(
        `UPDATE user SET emailAdress = ?, phoneNumber = ? WHERE id = ?`,
        [emailAdress, phoneNumber, userIdFromParams],
        (err) => {
          conn.release();

          if (err) {
            return next({
              status: 500,
              message: err.message || 'Update mislukt',
              data: {}
            });
          }

          res.status(200).json({
            status: 200,
            message: 'Gegevens succesvol bijgewerkt',
            data: {
              id: userIdFromParams,
              emailAdress,
              phoneNumber
            }
          });
        }
      );
    });
  } catch (err) {
    next({
      status: 500,
      message: err.message || 'Onbekende fout in updateUser',
      data: {}
    });
  }
},

deleteUser: (req, res, next) => {
  const userIdFromParams = parseInt(req.params.id);
  const userIdFromToken = req.userId;

  if (userIdFromParams !== userIdFromToken) {
    return res.status(403).json({
      status: 403,
      message: 'Je mag alleen je eigen account verwijderen.',
      data: {}
    });
  }

  db.getConnection((err, conn) => {
    if (err) return next({ status: 500, message: 'Databasefout', data: {} });

    // Check of de user bestaat
    conn.query('SELECT id FROM user WHERE id = ?', [userIdFromParams], (err, results) => {
      if (err) {
        conn.release();
        return next({ status: 500, message: 'Queryfout', data: {} });
      }

      if (results.length === 0) {
        conn.release();
        return res.status(404).json({
          status: 404,
          message: 'Gebruiker niet gevonden',
          data: {}
        });
      }

      // Verwijder de gebruiker
      conn.query('DELETE FROM user WHERE id = ?', [userIdFromParams], (err, deleteResult) => {
        conn.release();
        if (err) return next({ status: 500, message: 'Verwijderen mislukt', data: {} });

        res.status(200).json({
          status: 200,
          message: 'Gebruiker succesvol verwijderd',
          data: {}
        });
      });
    });
  });
}
};

module.exports = userController;