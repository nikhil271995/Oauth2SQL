'use strict';

const pool = require('../routes/utils/database').getPool();
const bCrypt = require('bcrypt-nodejs');

/**
 * Returns a user if it finds one, otherwise returns null if a user is not found.
 * @param   {String}   username - The unique user name to find
 * @param   {Function} done     - The user if found, otherwise returns undefined
 * @returns {Promise} resolved user if found, otherwise resolves undefined
 */

exports.findByUsername = username => new Promise(function (callback, reject) {
    pool.getConnection(function (err, connection) {
        connection.query("SELECT * from cd_users where email = ?", [username], function (error, user, feilds) {
            connection.release();
            if (error) {
                reject(error)
            }
            else {
                callback(user[0])
            }
        });
    });

});

exports.findByToken = token => new Promise(function (callback, reject) {
    pool.getConnection(function (err, connection) {
        connection.query("SELECT * from cd_users where id = (select user_id from cd_auth_token where token = ?)", [token], function (error, user, feilds) {
            connection.release();
            if (error) {
                reject(error)
            }
            else {
                callback(user[0])
            }
        });
    });
});

exports.createUser = (user, password_id) => new Promise(function (callback, reject) {
    pool.getConnection(function (err, connection) {
        connection.query("Insert into cd_users (name, email, phone, password_id) VALUES (?, ?, ?, ?)", [user.name, user.email, user.phone, password_id], function (err, user, fields) {
            connection.release();
            if (err)
                reject(err);
            else
                callback(user)
        });
    })
});

exports.createPassword = password => new Promise(function (callback, reject) {
    pool.getConnection(function (err, connection) {
        console.log(err);
        connection.query("Insert into cd_password (password_hash) VALUES (?)", [createHash(password)], function (err, password, fields) {
            connection.release();
            if (err)
                reject(err);
            else {
                console.log(password, fields, 'password');
                callback(password.insertId);
            }
        });
    });
});

exports.fetchPassword = password_id => new Promise(function (callback, reject) {
    pool.getConnection(function (err, connection) {
        connection.query("Select * from cd_password where id = ?", [password_id], function (err, password) {
            if (err)
                reject(err);
            else {
                if (password) {
                    callback(password[0]);
                } else {
                    reject(new Error('Invalid password'))
                }
            }
        });
    });
});

let createHash = function (password) {
    return bCrypt.hashSync(password, bCrypt.genSaltSync(10), null);
};
