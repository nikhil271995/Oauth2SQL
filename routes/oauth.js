let express = require('express');
let router = express.Router();

const token = require('./services/oauth/token');
const oauth2 = require('./services/oauth/oauth2');

// Login Controllers
require('./services/oauth/auth');

router.post('/oauth/token', oauth2.token);

router.get('/revoke', token.revoke);

module.exports = router;
