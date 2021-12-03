<<<<<<< HEAD
=======
//// START OF  Author MODEL////
>>>>>>> 2f8e9987bfcbd9a3367f3d23708aa52663bf5573
const pool = require('./pool');
const NodeCache = require("node-cache");
const cache = new NodeCache({ stdTTL: 120, checkperiod: 600 });

class Author {
    constructor(author) {
        this.id = author.id;
        this.name = author.name;
    }
}
//Get All

Author.getAll = (result) => {
    pool.query('SELECT * FROM author  ORDER BY id', (err, res) => {
<<<<<<< HEAD
        if (err) {
=======
        if(err) {
>>>>>>> 2f8e9987bfcbd9a3367f3d23708aa52663bf5573
            result(err, null);
        } else {
            result(null, res);
        }
    });
};

//Get by Id
Author.getById = (authorId, result) => {
    cacheValue = cache.get(`author${authorId}`);
<<<<<<< HEAD
    if (cacheValue == undefined) {
        pool.query('SELECT * FROM author WHERE id = ?', authorId, (err, res) => {
            if (err) {
                result(err, null);
            } else {
                if (res.length === 0) { // The author is not found for the given id
                    result(null, {});
                } else {
                    cache.set(`author${authorId}`, res[0]);
                    result(null, res[0]);
=======
    if(cacheValue == undefined) {
        pool.query('SELECT * FROM author WHERE id = ?', authorId, (err, res) => {
            if(err) {
                result(err, null);
            } else {
                if(res.length === 0) { // The author is not found for the given id
                    result(null, {});
                } else {
                    cache.set(`author${authorId}`, res);
                    result(null, res);
>>>>>>> 2f8e9987bfcbd9a3367f3d23708aa52663bf5573
                }
            }
        });
    } else {
        result(null, cacheValue);
    }
};

//create
Author.createAuthor = (author, result) => {
    pool.query("INSERT INTO author (name) VALUES ( ? )", author.name, (err, res) => {
<<<<<<< HEAD
        if (err) {
=======
        if(err) {
>>>>>>> 2f8e9987bfcbd9a3367f3d23708aa52663bf5573
            result(err, null);
        } else {
            result(null, { id: res.insertId, name: author.name });
        }
    });
};

// update

<<<<<<< HEAD
Author.updateAuthor = (authorId,author, result) => {
    pool.query(`UPDATE author  SET name= "${author.name}" WHERE id = ${authorId}`,(err, res) => {
        if (err) {
            result(err, null,500);
=======
Author.updateAuthor = (authorId, author, result) => {
    pool.query(`UPDATE author  SET name= "${author.name}" WHERE id = ${authorId}`, (err, res) => {
        console.log(res.affectedRows);
        if(err) {
            result(err, null, 500);
>>>>>>> 2f8e9987bfcbd9a3367f3d23708aa52663bf5573
        } else if(res.affectedRows===0){
            result({ error: 'Record not found' }, null, 404);
        } else {
            cache.del(`author${authorId}`);
            result(null, { id: authorId, name: author.name });
        }
    });
};

//remove
Author.deleteAuthor = (authorId, result) => {
    pool.getConnection((conErr, connection) => {
<<<<<<< HEAD
        if (conErr) {
            result(conErr, null, 500);
        } else {
            connection.query(`SELECT * FROM author WHERE id = ${authorId}`, (selErr, selRes) => {
                if (selErr) {
                    connection.release();
                    return result(selErr, null, 500);
                } else {
                    if (selRes.length === 0) { // The author is not found for the given id
=======
        if(conErr) {
            result(conErr, null, 500);
        } else {
            connection.query(`SELECT * FROM author WHERE id = ${authorId}`, (selErr, selRes) => {
                if(selErr) {
                    connection.release();
                    return result(selErr, null, 500);
                } else {
                    if(selRes.length === 0) { // The author is not found for the given id
>>>>>>> 2f8e9987bfcbd9a3367f3d23708aa52663bf5573
                        result({ error: 'Record not found' }, null, 404);
                        connection.release();
                    } else {
                        // Use one connection to DB for the 2 queries
                        connection.query(`DELETE FROM author WHERE id = ${authorId}`, (delErr, delRes) => {
                            connection.release();
<<<<<<< HEAD
                            if (delErr) {
                                result(delErr, null, 500);
                            } else {
                                result(null, selRes[0], 200);
=======
                            if(delErr) {
                                result(delErr, null, 500);
                            } else {
                                result(null, selRes, 200);
>>>>>>> 2f8e9987bfcbd9a3367f3d23708aa52663bf5573
                                cache.del(`author${authorId}`);
                            }
                        });
                    }
                }
            });
        }
    });
};


<<<<<<< HEAD
module.exports = Author;
=======
module.exports = Author;

//// END OF MODEL ////
>>>>>>> 2f8e9987bfcbd9a3367f3d23708aa52663bf5573
