const pool = require('./pool');
const NodeCache = require("node-cache");
const cache = new NodeCache({ stdTTL: 120, checkperiod: 600 });
const bcrypt = require('bcrypt');
class User {
    constructor(user) {
        this.id = user.id;
        this.userName = user.userName;
        this.email = user.email;
        this.password = user.password;
        this.roleId = user.roleId;
    }
}
//Get All

User.getAll = (result) => {
    var cachValue = cache.get(`allUsers`);
    if(cachValue == undefined) {
        pool.query('SELECT * FROM user  ORDER BY id', (err, res) => {
            if(err) {
                result(err, null);
            } else {
                cache.set(`allUsers`, res);
                result(null, res);
            }
        });
    } else {
        result(null, cachValue);
    }
};

//Get by Id
User.getById = (userId, result) => {
    cachValue = cache.get(`user${userId}`);
    if(cachValue == undefined) {
        pool.query('SELECT * FROM user WHERE id = ?', userId, (err, res) => {
            if(err) {
                result(err, null);
            } else {
                if(res.length === 0) { // The user is not found for the given id
                    result(null, {});
                } else {
                    cache.set(`user${userId}`, res[0]);
                    result(null, res[0]);
                }
            }
        });
    } else {
        result(null, cachValue);
    }
};
//get by userName 
User.getByName = (userName, result) => {
    cachValue = cache.get(`user${userName}`);
    if(cachValue == undefined) {
        pool.query(`SELECT * FROM user WHERE userName ="${userName}"`, (err, res) => {
            if(err) {
                result(err, null, 500);

            }
            else {
                if(res.length === 0) {
                    result(null, {}, 404);

                }
                else {
                    cache.set(`user+${userName}`, res[0]);
                    result(null, res[0], 200);

                }
            }
        });
    } else {
        result(null, cachValue);
    }

};

//create


User.register = (user, result) => {
    bcrypt.hash(user.password, 10, (err, hash) => {
        if(err) {
            result(err, null);
            return;
        }
        else {
            //pool.query(`INSERT INTO user(userName,email,password)VALUES(?,?,?)`,(err,res)=>{
            pool.query(`INSERT INTO user SET userName ="${user.userName}",email="${user.email}",password ="${hash}",roleId =${user.roleId}`, (err, res) => {
                if(err) {
                    result(err, null);
                    return;
                }
                else {

                    result(null, true);
                    // result(null,{id:res.insertId,userName:user.userName,email:user.email,password:user.password,roleId:user.roleId});
                    return;
                }
            });

        }
    });
};






// update

User.updateUser = (userId, user, result) => {
    pool.query(`UPDATE user  SET userName= "${user.userName}", email= "${user.email}", roleId= "${user.roleId}" WHERE id = ${userId}`, (err, res) => {
        if(err) {
            result(err, null, 500);
        } else if(res.affectedRows === 0) {
            result({ error: 'Record not found' }, null, 404);
        } else {
            cache.del(`user${userId}`);
            result(null, { id: userId, userName: user.userName, email: user.email, roleId: user.roleId });
        }
    });
};

//remove
User.deleteUser = (userId, result) => {
    pool.getConnection((conErr, connection) => {
        if(conErr) {
            result(conErr, null, 500);
        } else {
            connection.query(`SELECT * FROM user WHERE id = ${userId}`, (selErr, selRes) => {
                if(selErr) {
                    connection.release();
                    result(selErr, null, 500);
                } else {
                    if(selRes.length === 0) { // The user is not found for the given id
                        result({ error: 'Record not found' }, null, 404);
                        connection.release();
                    } else {
                        // Use one connection to DB for the 2 queries
                        connection.query(`DELETE FROM user WHERE id = ${userId}`, (delErr, delRes) => {
                            connection.release();
                            if(delErr) {
                                result(delErr, null, 500);
                            } else {
                                result(null, selRes[0], 200);
                                cache.del(`user${userId}`);
                            }
                        });
                    }
                }
            });
        }
    });
};

// change password 
User.changePassword = (userId, newPassword, oldPassword, result) => {
    pool.getConnection((err, connection) => {
        if(err) {
            result(err, null, 500);
            return;
        }
        else {
            connection.query(`SELECT * FROM user WHERE id =${userId}`, (errGet, resGet) => {
                if(errGet) {
                    connection.release();
                    result(errGet, null, 500);
                    return;
                }
                else {
                    if(resGet.length === 0) {
                        connection.release();
                        result({ error: "user is not exist" }, null, 404);
                        return;
                    }
                    else {
                        bcrypt.compare(oldPassword, resGet[0].password, (err, isCorecct) => {
                            if(err) {
                                connection.release();
                                result(err, null, 500);
                                return;
                            }
                            else {
                                if(!isCorecct) {
                                    connection.release();
                                    result({ error: "password is not correct" }, null, 400);
                                    return;

                                }
                                else {
                                    bcrypt.hash(newPassword, 10, (err, hash) => {
                                        if(err) {
                                            connection.release();
                                            result(err, null, 500);
                                            return;
                                        }
                                        else {

                                            connection.query(`UPDATE user SET password ="${hash}"WHERE id =  ${userId}`, (errUp, resUp) => {
                                                connection.release();
                                                if(errUp) {
                                                    result(errUp, null, 500);
                                                    return;
                                                }
                                                else {
                                                    result(null, true, 204);
                                                    return;
                                                }
                                            });
                                        }
                                    });

                                }
                            }
                        });
                    }

                }
            });
        }
    });
};

// get roleName
User.getRole = (roleId, result) => {
    pool.query(`SELECT roleName FROM role r INNER JOIN user u ON r.id = u.roleId `, (err, res) => {
        if(err) {

            result(err, null, 500);
            return;
        }
        else {
            if(res.length === 0) {
                result({ error: "user is not exist" }, null, 404);
                return;
            }
            else {
                result(null, res[0], 200);
                return;
            }
        }
    })
}

// login user
User.login = (userName, password, result) => {
    pool.query(`SELECT * FROM user WHERE userName ="${userName}"`, (err, res) => {
        if(err) {
            result(err, null, 500);
            return;
        }
        else {
            if(res.length === 0) {
                result({ error: "password or userName are not correct" }, null, 400);
                return;
            }
            else {
                bcrypt.compare(password, res[0].password, (err, isCorecct) => {
                    if(err) {
                        result(err, null, 500);
                        return;
                    }
                    else {
                        if(!isCorecct) {
                            result({ error: "password or username is not correct" }, null, 400);
                            return;
                        }
                        else {
                            result(null, res[0], 200);
                            return;
                        }
                    }
                });
            }
        }
    });
};

User.ListFavorateBooks = (userId, result) => {
    cachValue = cache.get(`allFavBooks`);
    if(cachValue == undefined) {
        pool.query(`select * from book b join userbooksfav ubf on ubf.bookId = b.id where ubf.userId=${userId}`, (Qerr, favBooks) => {
            if(Qerr) {
                result(Qerr, null, 500);
            }
            else {
                cache.set(`allFavBooks`, favBooks);
                result(null, favBooks, 200);
            }
        });
    } else {
        result(null, cachValue,200);
    }
}


module.exports = User;
