
const jwt = require('jsonwebtoken');
const db = require('../dao/mysql-db');
const logger = require('../util/logger');
const jwtSecretKey = require('../util/config').secretkey;

const authService = {
  login: (userCredentials, callback) => {
    logger.debug('login', userCredentials.emailAdress);

    db.getConnection((err, connection) => {
      if (err) {
        logger.error(err);
        return callback({ status: 500, message: 'Databasefout' });
      }

      connection.query(
        'SELECT id, emailAdress, password, firstName, lastName FROM user WHERE emailAdress = ?',
        [userCredentials.emailAdress],
        (err, rows) => {
          connection.release();

          if (err) {
            logger.error('Query error:', err);
            return callback({ status: 500, message: 'Databasequery mislukt' });
          }

          if (rows.length === 0) {
            return callback({ status: 404, message: 'Gebruiker bestaat niet' });
          }

          const user = rows[0];

          if (user.password !== userCredentials.password) {
            return callback({ status: 400, message: 'Ongeldig e-mailadres of wachtwoord' });
          }

          const payload = { userId: user.id };

          jwt.sign(payload, jwtSecretKey, { expiresIn: '12d' }, (err, token) => {
            if (err) {
              return callback({ status: 500, message: 'Token signing error' });
            }

            callback(null, {
              status: 200,
              message: 'User logged in',
              data: {
                id: user.id,
                emailAdress: user.emailAdress,
                firstName: user.firstName,
                lastName: user.lastName,
                token: token
              }
            });
          });
        }
      );
    });
  },

  register: (user, callback) => {
    db.getConnection((err, conn) => {
      if (err) return callback({ status: 500, message: 'Databasefout' });

      conn.query('SELECT id FROM user WHERE emailAdress = ?', [user.emailAdress], (err, rows) => {
        if (err) {
          conn.release();
          return callback({ status: 500, message: 'Queryfout' });
        }

        if (rows.length > 0) {
          conn.release();
          return callback({ status: 403, message: 'Gebruiker bestaat al' });
        }

        conn.query(
          `INSERT INTO user 
           (emailAdress, password, firstName, lastName, phoneNumber, street, city)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [
            user.emailAdress,
            user.password, // plain text
            user.firstName,
            user.lastName,
            user.phoneNumber,
            user.street,
            user.city
          ],
          (err, results) => {
            conn.release();

            if (err) {
              logger.error('Insert error:', err);
              return callback({ status: 500, message: 'Fout bij opslaan gebruiker' });
            }

           callback(null, {
           id: results.insertId,
           emailAdress: user.emailAdress,
           firstName: user.firstName,
           lastName: user.lastName
});
          }
        );
      });
    });
  }
};

module.exports = authService;
