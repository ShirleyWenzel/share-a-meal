const db = require('../dao/mysql-db');

const userController = {
  getAllUsers: (req, res, next) => {
    const filters = [];
    const values = [];

    // Filter op active status (UC-202 pad A)
    if (req.query.isActive !== undefined) {
      filters.push('isActive = ?');
      values.push(Number(req.query.isActive)); // Zorg dat het een integer is (0 of 1)
    }

    // Filter op voornaam (UC-202 pad B)
    if (req.query.firstName) {
      filters.push('firstName LIKE ?');
      values.push(`%${req.query.firstName}%`);
    }

    // Filter op e-mailadres (UC-202 pad B)
    if (req.query.emailAdress) {
      filters.push('emailAdress LIKE ?');
      values.push(`%${req.query.emailAdress}%`);
    }

    // Combineer alle filters in een WHERE clause
    const whereClause = filters.length > 0 ? `WHERE ${filters.join(' AND ')}` : '';

    db.getConnection((err, conn) => {
      if (err) {
        return next({
          status: 500,
          message: 'Databaseverbinding mislukt',
          data: {}
        });
      }

      const query = `SELECT id, firstName, lastName, emailAdress, isActive FROM user ${whereClause}`;
      
      conn.query(query, values, (err, results) => {
        conn.release();

        if (err) {
          return next({
            status: 500,
            message: 'Databasequery mislukt',
            data: {}
          });
        }

        res.status(200).json({
          status: 200,
          message: 'Gebruikers succesvol opgehaald',
          data: results
        });
      });
    });
  }
};

module.exports = userController;
