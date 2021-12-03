const pool = require('./pool');
const NodeCache = require("node-cache");
const cache = new NodeCache({ stdTTL: 120, checkperiod: 600 });

class Role {
    constructor(role) {
        this.id = role.id;
        this.roleName = role.roleName;
    }
}
//Get All

Role.getAll = (result) => {
    pool.query('SELECT * FROM role  ORDER BY id', (err, res) => {
        if (err) {
            result(err, null);
        } else {
            result(null, res);
        }
    });
};

//Get by Id
Role.getById = (roleId, result) => {
    cacheValue = cache.get(`role${roleId}`);
    if (cacheValue == undefined) {
        pool.query('SELECT * FROM role WHERE id = ?', roleId, (err, res) => {
            if (err) {
                result(err, null);
            } else {
                if (res.length === 0) { // The role is not found for the given id
                    result(null, {});
                } else {
                    cache.set(`role${roleId}`, res[0]);
                    result(null, res[0]);
                }
            }
        });
    } else {
        result(null, cacheValue);
    }
};

//create
Role.createRole = (role, result) => {
    pool.query("INSERT INTO role (roleName) VALUES ( ? )", role.roleName, (err, res) => {
        if (err) {
            result(err, null);
        } else {
            result(null, { id: res.insertId, roleName: role.roleName });
        }
    });
};

// update

Role.updateRole = (roleId,role, result) => {
    pool.query(`UPDATE role  SET roleName= "${role.roleName}" WHERE id = ${roleId}`,(err, res) => {
        if (err) {
            result(err, null,500);
        } else if(res.affectedRows===0){
            result({ error: 'Record not found' }, null, 404);
        } else {
            cache.del(`role${roleId}`);
            result(null, { id: roleId, roleName: role.roleName });
        }
    });
};

//remove
Role.deleteRole = (roleId, result) => {
    pool.getConnection((conErr, connection) => {
        if (conErr) {
            result(conErr, null, 500);
        } else {
            connection.query(`SELECT * FROM role WHERE id = ${roleId}`, (selErr, selRes) => {
                if (selErr) {
                    connection.release();
                    return result(selErr, null, 500);
                } else {
                    if (selRes.length === 0) { // The role is not found for the given id
                        result({ error: 'Record not found' }, null, 404);
                        connection.release();
                    } else {
                        // Use one connection to DB for the 2 queries
                        connection.query(`DELETE FROM role WHERE id = ${roleId}`, (delErr, delRes) => {
                            connection.release();
                            if (delErr) {
                                result(delErr, null, 500);
                            } else {
                                result(null, selRes[0], 200);
                                cache.del(`role${roleId}`);
                            }
                        });
                    }
                }
            });
        }
    });
};


module.exports = Role;
