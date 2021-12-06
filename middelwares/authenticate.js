const User = require('../models/user');
const jwt = require('jsonwebtoken');
const secretKey  =  require('../shared/secretKey');

const authenticate = (req, res, next) => {
    if (isAllowedRoute(req)) {
        return next();
    }

    const bearerHeader = req.headers['authorization'];
    if (typeof bearerHeader !== 'undefined') {
        const bearer = bearerHeader.split(' ');
        const bearerToken = bearer[1];
        req.token = bearerToken;

        jwt.verify(bearerToken, secretKey, (err, authData) => {
            if (err) {
                res.sendStatus(403);
            } else {
                requestVerifiesRules(req, authData.user.id, (err, rulesAreVerified) => {
                    if (err) {
                        res.status(403).send('Error while verifying rules'); // Forbidden
                    } else {
                        if (rulesAreVerified) {
                            next();
                        } else {
                            res.sendStatus(403); // Forbidden
                        }
                    }
                });
            }
        });
    } else {
        res.status(403).send('Invalid authorization header'); // Forbidden
    }
};

function isAllowedRoute(req) {
    // Allowed Routes:
    return ([
        '/api/users/Register',
        '/api/users/Login'
    ].indexOf(req.path) >= 0);
}

requestVerifiesRules = (req, userId, result) => {
    // Allowed Methods for all authenticated users:
    if (req.method == 'GET') {
        result(null, true);
    } else {
        // Allowed Roles:
        User.hasRole(userId, 'Administrators', (err, res) => {
            if (err) {
                result(err, false);
            } else {
                result(null, res);
            }
        });
    }
};

module.exports = authenticate;
