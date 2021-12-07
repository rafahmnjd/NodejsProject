const User = require('../models/user');
const jwt = require('jsonwebtoken');
const secretKey = require('../shared/secretKey');

const auth = (req, res, next) => {
    if(isAllowedRoute(req)) {
        return next();
    }

    const bearerHeader = req.headers['authorization'];
    if(typeof bearerHeader !== 'undefined') {
        const bearer = bearerHeader.split(' ');
        const bearerToken = bearer[1];
        req.token = bearerToken;

        jwt.verify(req.token, secretKey, (err, authData) => {
            if(err) {
                res.status(40).send("token expierd please login again");
            } else {
                req.userId = authData.id;
                req.roleId = authData.roleId;
                return next();
            }
        });
    } else {
        res.status(403).send('Invalid authorization header'); // Forbidden
    }
};


function isAllowedRoute(req) {
    // Allowed Routes:
    return (
        (['/api/users/register/', '/api/users/login/',].indexOf(req.path) >= 0)
        || (req.method = 'GET' && (['/api/books/', `/api/books/${req.p}`,].indexOf(req.path) >= 0))
    );
}


module.exports = auth;
