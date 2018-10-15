'use strict';

const pool = require('../routes/utils/database').getPool();

/**
 * This is the configuration of the clients that are allowed to connected to your authorization
 * server. These represent client applications that can connect. At a minimum you need the required
 * properties of
 *
 * id:           A unique numeric id of your client application
 * name:         The name of your client application
 * clientId:     A unique id of your client application
 * clientSecret: A unique password(ish) secret that is _best not_ shared with anyone but your
 *               client application and the authorization server.
 *
 * Optionally you can set these properties which are
 *
 * trustedClient: default if missing is false. If this is set to true then the client is regarded
 * as a trusted client and not a 3rd party application. That means that the user will not be
 * presented with a decision dialog with the trusted application and that the trusted application
 * gets full scope access without the user having to make a decision to allow or disallow the scope
 * access.
 */

/**
 * Returns a client if it finds one, otherwise returns null if a client is not found.
 * @param   {String}   id   - The unique id of the client to find
 * @returns {Promise}  resolved promise with the client if found, otherwise undefined
 */
exports.find = id => new Promise(function (callback, reject) {
    pool.getConnection(function (err, connection) {
        connection.query("SELECT id, client_id as clientId,  client_secret as client_secret, name from cd_auth_client where id = ?", [id], function (error, user, feilds) {
            connection.release();
            if (error) {
                reject(error);
            }
            else {
                let output = {
                    id: user[0].id,
                    name: user[0].name,
                    clientId: user[0].clientId,
                    clientSecret: user[0].clientSecret,
                    trustedClient: true
                };
                callback(output)
            }
        });
    });

});

/**
 * Returns a client if it finds one, otherwise returns null if a client is not found.
 * @param   {String}   clientId - The unique client id of the client to find
 * @param   {Function} done     - The client if found, otherwise returns undefined
 * @returns {Promise} resolved promise with the client if found, otherwise undefined
 */

exports.findByClientId = clientId => new Promise(function (callback, reject) {
    pool.getConnection(function (err, connection) {
        let sql = "SELECT id, client_id as clientId, name, client_secret as clientSecret FROM cd_auth_client where client_id = ?";
        connection.query(sql, [clientId], function (error, user, feilds) {
            connection.release();
            if (error) {
                reject(error);
            } else {
                callback(user[0])
            }
        });
    });
});
