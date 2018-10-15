let db = require('../../../repositories');

module.exports.profile = function (req, res) {
    res.send(req.user);
};

module.exports.createUser = (req, res) =>
    db.users.createPassword(req.body.password)
        .then((password_id) => db.users.createUser(req.body, password_id))
        .then((user) => {
            res.send(user)
        }).catch((err => {
        res.send(err);
    }));
