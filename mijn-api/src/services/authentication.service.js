const jwt = require('jsonwebtoken')
const db = require('../dao/mysql-db')
const logger = require('../util/logger')
const jwtSecretKey = require('../util/config').secretkey

const authService = {
    login: (userCredentials, callback) => {
        logger.debug('login');
        db.getConnection((err, connection) => {
            if (err) {
                logger.error(err);
                return callback({ status: 500, message: 'Databasefout' });
            }

            connection.query(
                'SELECT `id`, `emailAdress`, `password`, `firstName`, `lastName` FROM `user` WHERE `emailAdress` = ?',
                [userCredentials.emailAdress],
                (err, rows) => {
                    connection.release();
                    if (err) {
                        logger.error('Error: ', err.toString());
                        return callback({ status: 500, message: err.message });
                    }

                    if (rows.length === 1 && rows[0].password === userCredentials.password) {
                        const { password, ...userinfo } = rows[0];
                        const payload = { userId: userinfo.id };

                        jwt.sign(payload, jwtSecretKey, { expiresIn: '12d' }, (err, token) => {
                            if (err) {
                                return callback({ status: 500, message: 'Token signing error' });
                            }
                            callback(null, {
                                status: 200,
                                message: 'User logged in',
                                data: { ...userinfo, token }
                            });
                        });
                    } else {
                        return callback({ status: 400, message: 'Ongeldig e-mailadres of wachtwoord' });
                    }
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
                    return callback({ status: 409, message: 'Email bestaat al' });
                }

                conn.query(
                    `INSERT INTO user (emailAdress, password, firstName, lastName) VALUES (?, ?, ?, ?)`,
                    [user.emailAdress, user.password, user.firstName, user.lastName],
                    (err, results) => {
                        conn.release();
                        if (err) return callback({ status: 500, message: 'Fout bij opslaan' });
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
}

module.exports = authService
