var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function (req, res, next) {
    res.send('respond with a resource');
});

const usersService = require('./services/users/users_service');
const authUtil = require('./utils/auth');

router.get('/profile', authUtil.ensure, usersService.profile);
router.post('/create', usersService.createUser);

module.exports = router;
