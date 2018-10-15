'use strict';

// Register supported grant types.
//
// oauth 2.0 specifies a framework that allows users to grant client
// applications limited access to their protected resources.  It does this
// through a process of the user granting access, and the client exchanging
// the grant for an access token.

const config = require('../../../config/index');
const db = require('../../../repositories/index');
const oauth2orize = require('oauth2orize');
const passport = require('passport');
const utils = require('./utils');
const validate = require('./validate');

// create oauth 2.0 server
const server = oauth2orize.createServer();

// Configured expiresIn
const expiresIn = {expires_in: config.token.expiresIn};

/**
 * Exchange user id and password for access tokens.
 *
 * The callback accepts the `client`, which is exchanging the user's name and password
 * from the token request for verification. If these values are validated, the
 * application issues an access token on behalf of the user who authorized the code.
 */
server.exchange(oauth2orize.exchange.password((client, username, password, scope, done) => {
    db.users.findByUsername(username)
        .then(user => validate.password(user, password))
        .then(user => validate.generateTokens({scope, userID: user.id, clientID: client.id}))
        .then((tokens) => {
            if (tokens === false) {
                return done(null, false);
            }
            if (tokens.length === 1) {
                return done(null, tokens[0], null, expiresIn);
            }
            if (tokens.length === 2) {
                return done(null, tokens[0], tokens[1], expiresIn);
            }
            throw new Error('Error exchanging password for tokens');
        })
        .catch((err) => {
            done(null, false)
        });
}));

/**
 * Exchange the client id and password/secret for an access token.
 *
 * The callback accepts the `client`, which is exchanging the client's id and
 * password/secret from the token request for verification. If these values are validated, the
 * application issues an access token on behalf of the client who authorized the code.
 */
server.exchange(oauth2orize.exchange.clientCredentials((client, scope, done) => {
    const token = utils.createToken({sub: client.id, exp: config.token.expiresIn});
    const expiration = config.token.calculateExpirationDate();
    // Pass in a null for user id since there is no user when using this grant type
    db.accessTokens.save(token, expiration, null, client.id, scope)
        .then(() => done(null, token, null, expiresIn))
        .catch(err => done(err));
}));

/**
 * Exchange the refresh token for an access token.
 *
 * The callback accepts the `client`, which is exchanging the client's id from the token
 * request for verification.  If this value is validated, the application issues an access
 * token on behalf of the client who authorized the code
 */
server.exchange(oauth2orize.exchange.refreshToken((client, refreshToken, scope, done) => {
    db.refreshTokens.find(refreshToken)
        .then(foundRefreshToken => validate.refreshToken(foundRefreshToken, refreshToken, client))
        .then(foundRefreshToken => validate.generateToken(foundRefreshToken))
        .then(token => done(null, token, null, expiresIn))
        .catch(() => done(null, false));
}));

/**
 * Token endpoint
 *
 * `token` middleware handles client requests to exchange authorization grants
 * for access tokens.  Based on the grant type being exchanged, the above
 * exchange middleware will be invoked to handle the request.  Clients must
 * authenticate when making requests to this endpoint.
 */
exports.token = [
    passport.authenticate(['basic'], {session: false}),
    server.token(),
    server.errorHandler(),
];

// Register serialialization and deserialization functions.
//
// When a client redirects a user to user authorization endpoint, an
// authorization transaction is initiated.  To complete the transaction, the
// user must authenticate and approve the authorization request.  Because this
// may involve multiple HTTPS request/response exchanges, the transaction is
// stored in the session.
//
// An application must supply serialization functions, which determine how the
// client object is serialized into the session.  Typically this will be a
// simple matter of serializing the client's ID, and deserializing by finding
// the client by ID from the database.

server.serializeClient((client, done) => done(null, client.id));

server.deserializeClient((id, done) => {
    db.clients.find(id)
        .then(client => done(null, client))
        .catch(err => done(err));
});

