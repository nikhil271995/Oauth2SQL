'use strict';

const jwt = require('jsonwebtoken');
const pool = require('../routes/utils/database').getPool();

// The refresh tokens.
// You will use these to get access tokens to access your end point data through the means outlined
// in the RFC The OAuth 2.0 Authorization Framework: Bearer Token Usage
// (http://tools.ietf.org/html/rfc6750)

/**
 * Returns a refresh token if it finds one, otherwise returns null if one is not found.
 * @param   {String}  token - The token to decode to get the id of the refresh token to find.
 * @returns {Promise} resolved with the token
 */
exports.find = (token) => new Promise(function (resolve, reject) {
    pool.getConnection(function (err, connection) {
        let sql = "SELECT user_id, client_id from cd_refresh_token where refresh_token = ?";
        connection.query(sql, token, function (error, user, feilds) {
            connection.release();
            if (error) {
                resolve(undefined);
            }
            if (user && user[0]) {
                let scope = ['offline_access'], userID = user[0].user_id, clientID = user[0].client_id;
                let log = {userID, clientID, scope};
                resolve(log);
            } else {
                resolve(undefined);
            }
        });
    });
});
/**
 * Saves a refresh token, user id, client id, and scope. Note: The actual full refresh token is
 * never saved.  Instead just the ID of the token is saved.  In case of a database breach this
 * prevents anyone from stealing the live tokens.
 * @param   {Object}  token    - The refresh token (required)
 * @param   {String}  userID   - The user ID (required)
 * @param   {String}  clientID - The client ID (required)
 * @param   {String}  scope    - The scope (optional)
 * @returns {Promise} resolved with the saved token
 */
exports.save = (token, userID, clientID, scope) => {
    // // cd_employee_refresh_token
    let sql = "INSERT INTO cd_refresh_token (refresh_token, user_id, client_id) VALUES (?, ?, ?)";
    return new Promise(function (resolve, reject) {
        pool.getConnection(function (err, connection) {
            connection.query(sql, [token, userID, clientID], function (error, user, feilds) {
                console.log("in query refresh");
                connection.release();
                if (error) {
                    console.log(error);
                    return resolve(null);
                }
                return resolve({userID, clientID, scope});
            });
        });
    });
    // return Promise.resolve({ userID, clientID, scope });
};

/**
 * Deletes a refresh token
 * @param   {String}  token - The token to decode to get the id of the refresh token to delete.
 * @returns {Promise} resolved with the deleted token
 */
exports.delete = (token) => {
    try {
        return new Promise(function (resolve, reject) {
            let sql = "DELETE FROM cd_refresh_token where refresh_token = (?)";
            pool.getConnection(function (err, connection) {
                connection.query(sql, [token], function (error, user, feilds) {
                    connection.release();
                    if (error) {
                        console.log(error);
                        return resolve(undefined);
                    }
                    if (user.affectedRows)
                        return resolve({token});
                    else
                        return resolve(undefined);
                });
            });
        })
    } catch (error) {
        return Promise.resolve(undefined);
    }
};

/**
 * Removes all refresh tokens.
 * @returns {Promise} resolved with all removed tokens returned
 */
exports.removeAll = () => {
    const deletedTokens = Object.create(null);
    return Promise.resolve(deletedTokens);
};
