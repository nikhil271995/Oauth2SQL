'use strict';

const db = require('../../../repositories/index');
const passport = require('passport');
const {Strategy: LocalStrategy} = require('passport-local');
const {BasicStrategy} = require('passport-http');
const {Strategy: ClientPasswordStrategy} = require('passport-oauth2-client-password');
const {Strategy: BearerStrategy} = require('passport-http-bearer');
const validate = require('./validate');

/**
 * BasicStrategy & ClientPasswordStrategy
 *
 * These strategies are used to authenticate registered oauth clients.  They are
 * employed to protect the `token` endpoint, which consumers use to obtain
 * access tokens.  The oauth 2.0 specification suggests that clients use the
 * HTTP Basic scheme to authenticate.  Use of the client password strategy
 * allows clients to send the same credentials in the request body (as opposed
 * to the `Authorization` header).  While this approach is not recommended by
 * the specification, in practice it is quite common.
 */

passport.use(new BasicStrategy(function (clientId, clientSecret, done) {
    db.clients.findByClientId(clientId)
        .then(client => validate.client(client, clientSecret))
        .then(client => done(null, client))
        .catch(() => done(null, false));
}));

/**
 * Client Password strategy
 *
 * The oauth 2.0 client password authentication strategy authenticates clients
 * using a client ID and client secret. The strategy requires a verify callback,
 * which accepts those credentials and calls done providing a client.
 */

passport.use(new ClientPasswordStrategy((clientId, clientSecret, done) => {
    db.clients.findByClientId(clientId)
        .then(client => validate.client(client, clientSecret))
        .then(client => done(null, client))
        .catch(() => done(null, false));
}));

/**
 * BearerStrategy
 *
 * This strategy is used to authenticate either users or clients based on an access token
 * (aka a bearer token).  If a user, they must have previously authorized a client
 * application, which is issued an access token to make requests on behalf of
 * the authorizing user.
 *
 * To keep this example simple, restricted scopes are not implemented, and this is just for
 * illustrative purposes
 */

passport.use(new BearerStrategy((accessToken, done) => {
    db.accessTokens.find(accessToken)
        .then(token => validate.token(token, accessToken))
        .then(token => done(null, token, {scope: '*'}))
        .catch(() => done(null, false));
}));
