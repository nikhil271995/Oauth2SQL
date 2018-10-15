let passport = require('passport');

module.exports.ensure = [
    passport.authenticate('bearer', {session: false}),
    (req, res, next) => {
        next();
    },
];