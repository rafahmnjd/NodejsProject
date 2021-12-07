// const User = require('../models/user');
const jwt = require('jsonwebtoken');
const secretKey = require('../shared/secretKey');



function auth(req, res,role, next) {
    if(isAllowedRoute(req)) {
        return next();
    }

    const bearerheader = req.headers['authorization'];
    //console.log(bearerheader)
    if(typeof bearerheader !== 'undefined') {
        const bearer = bearerheader.split(' ');
        const bearerToken = bearer[1];
        req.token = bearerToken;

        jwt.verify(req.token, secretKey, (err, authData) => {
            if(err) {
                console.log(err);
                res.status(401).send("Unauthorized ,please login again");
            }
            else {
                req.userId = authData.id;
                console.log(authData);
                if(authData.roleId === 1) {
                    next();
                }
                if(authData.roleId === 2) {
                    const url = req.url;
                    const arrUrl = url.split('/');
                    const id = arrUrl[arrUrl.length - 1];
                    //console.log(id)
                    //console.log(((req.method==='PUT')||(req.method==='GET'))&&((req.url=='/api/users/favbook/'+id)||(req.url=='/api/users/favbook/isRead/'+id)||((req.url=='/api/users/favbook/favorder/'+id))))
                    if((req.method == 'GET') && (req.url == `/api/books/${id}`)) {
                        next();
                    }

                    else if((req.method == 'GET') && (req.url == `/api/books/login/${authData.id}`)) {
                        req.params.userId = authData.id;
                        next();

                    }

                    else if(((req.method === 'GET') || (req.method === 'PUT')) && (req.url == '/api/users/login/' + authData.id) || (req.url == '/api/users/' + authData.id)) {
                        req.params.userId = authData.id;
                        next();



                    }

                    else if((req.method === 'GET') && (req.url == '/api/users/favbook/' + authData.id)) {
                        req.params.userId = authData.id;
                        next()
                    }
                    else if(((req.method === 'PUT') || (req.method === 'POST')) && ((req.url == '/api/users/favbook/' + authData.id + '/' + id) || (req.url == '/api/users/favbook/isRead/' + authData.id + '/' + id) || ((req.url == '/api/users/favbook/favorder/' + authData.id + '/' + id)))) {
                        req.params.userId = authData.id;

                        next();

                    }
                    else {
                        res.status(401).send("Unauthorized");


                    }


                }

            }
        });

    }
    if(bearerheader == undefined) {
        console.log(req.url)
        if((req.method === 'GET') && (req.url === '/api/books/')) {
            next();

        }
        else {
            res.status(401).send("Unauthorized");

        }

    }


}

function isAllowedRoute(req) {
    // Allowed Routes:
    return (
        (['/api/users/register/', '/api/users/login/',].indexOf(req.path) >= 0)
        || (req.method = 'GET' && (['/api/books/', '/api/authors/',].indexOf(req.path) >= 0))
    );
}

function onlyAdmin(req) {
    
}
module.exports = auth;


















