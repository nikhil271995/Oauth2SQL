'use strict';

const jwt = require('jsonwebtoken');
const pool = require('../routes/utils/database').getPool();


// The access tokens.
// You will use these to access your end point data through the means outlined
// in the RFC The OAuth 2.0 Authorization Framework: Bearer Token Usage
// (http://tools.ietf.org/html/rfc6750)

/**
 * Returns an access token if it finds one, otherwise returns null if one is not found.
 * @param   {String}  token - The token to decode to get the id of the access token to find.
 * @returns {Promise} resolved with the token if found, otherwise resolved with undefined
 */
exports.find = (token) => {
    try {
        return new Promise(function (callback, reject) {
            pool.getConnection(function (err, connection) {
                let sql = "SELECT token, expiry_timestamp as expirationDate, user_id as userID, client_id as clientID from cd_auth_token where token = ?";
                connection.query(sql, [token], function (error, user, feilds) {
                    connection.release();
                    if (error) {
                        reject(error)
                    } else {
                        if (user.length) {
                            let output = {
                                userID: user[0].userID,
                                expirationDate: user[0].expirationDate,
                                clientID: user[0].clientID,
                                scope: ['offline_access']
                            };
                            callback(output)
                        } else {
                            err = new Error("invalid auth token");
                            reject(err)
                        }
                    }
                });
            });

        })
    } catch (error) {
        return Promise.resolve(undefined);
    }
};

/**
 * Saves a access token, expiration date, user id, client id, and scope. Note: The actual full
 * access token is never saved.  Instead just the ID of the token is saved.  In case of a database
 * breach this prevents anyone from stealing the live tokens.
 * @param   {Object}  token          - The access token (required)
 * @param   {Date}    expirationDate - The expiration of the access token (required)
 * @param   {String}  userID         - The user ID (required)
 * @param   {String}  clientID       - The client ID (required)
 * @param   {String}  scope          - The scope (optional)
 * @returns {Promise} resolved with the saved token
 */
exports.save = (token, expirationDate, userID, clientID, scope) => {
    let sql = "INSERT INTO cd_auth_token (token, expiry_timestamp, user_id, client_id) VALUES (?, ?, ?, ?)";
    return new Promise(function (resolve, reject) {
        pool.getConnection(function (err, connection) {
            connection.query(sql, [token, expirationDate, userID, clientID], function (error, user, feilds) {
                connection.release();
                if (error) {
                    return resolve(null);
                }
                return resolve({userID, expirationDate, clientID, scope});
            });
        });
    });
};

/**
 * Deletes/Revokes an access token by getting the ID and removing it from the storage.
 * @param   {String}  token - The token to decode to get the id of the access token to delete.
 * @returns {Promise} resolved with the deleted token
 */
exports.delete = (token) => {
    try {
        return new Promise(function (resolve, reject) {
            let sql = "DELETE FROM cd_auth_token where token = (?)";
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
 * Removes expired access tokens. It does this by looping through them all and then removing the
 * expired ones it finds.
 * @returns {Promise} resolved with an associative of tokens that were expired
 */

exports.removeExpired = () => {
    return new Promise(function (resolve, reject) {
        let sql = "SELECT * FROM cd_auth_token where ( " + new Date() + "> expiry_timestamp";
        pool.getConnection(function (err, connection) {
            connection.query(sql, [token], function (error, user, feilds) {
                connection.release();
                if (error) {
                    console.log(error);
                    return resolve(undefined);
                }
                return resolve({});
            });
        });
    });
};

/**
 * Removes all access tokens.
 * @returns {Promise} resolved with all removed tokens returned
 */
exports.removeAll = () => {
    const deletedTokens = Object.create(null);
    // tokens = Object.create(null);
    return Promise.resolve(deletedTokens);
};
