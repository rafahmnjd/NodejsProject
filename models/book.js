const pool = require('./pool');
const NodeCache = require("node-cache");
const cache = new NodeCache({ stdTTL: 120, checkperiod: 600 });

class Book {
    constructor(book) {
        this.id = book.id;
        this.title = book.title;
        this.authorId = book.authorId;
        this.ISBN = book.ISBN;
        this.image = book.image;
    }
}
//Get All

Book.getAll = (result) => {
    pool.query('SELECT * FROM book  ORDER BY id', (err, res) => {
        if (err) {
            result(err, null);
        } else {
            result(null, res);
        }
    });
};

//Get by Id
Book.getById = (bookId, result) => {
    cacheValue = cache.get(`book${bookId}`);
    if (cacheValue == undefined) {
        pool.query('SELECT * FROM book WHERE id = ?', bookId, (err, res) => {
            if (err) {
                result(err, null);
            } else {
                if (res.length === 0) { // The book is not found for the given id
                    result(null, {});
                } else {
                    cache.set(`book${bookId}`, res[0]);
                    result(null, res[0]);
                }
            }
        });
    } else {
        result(null, cacheValue);
    }
};

//create
Book.createBook = (book, result) => {
    pool.query("INSERT INTO book (title, authorId, ISBN, image) VALUES ( ? , ? , ? , ? )", [book.title, book.authorId, book.ISBN, book.image], (err, res) => {
        if (err) {
            result(err, null);
        } else {
            result(null, { id: res.insertId, title: book.title, authorId: book.authorId, ISBN: book.ISBN, image: book.image });
        }
    });
};

// update

Book.updateBook = (bookId,book, result) => {
    pool.query(`UPDATE book  SET title= "${book.title}", authorId= "${book.authorId}", ISBN= "${book.ISBN}", image= "${book.image}" WHERE id = ${bookId}`,(err, res) => {
        if (err) {
            result(err, null,500);
        } else if(res.affectedRows===0){
            result({ error: 'Record not found' }, null, 404);
        } else {
            cache.del(`book${bookId}`);
            result(null, { id: bookId, title: book.title, authorId: book.authorId, ISBN: book.ISBN, image: book.image });
        }
    });
};

//remove
Book.deleteBook = (bookId, result) => {
    pool.getConnection((conErr, connection) => {
        if (conErr) {
            result(conErr, null, 500);
        } else {
            connection.query(`SELECT * FROM book WHERE id = ${bookId}`, (selErr, selRes) => {
                if (selErr) {
                    connection.release();
                    return result(selErr, null, 500);
                } else {
                    if (selRes.length === 0) { // The book is not found for the given id
                        result({ error: 'Record not found' }, null, 404);
                        connection.release();
                    } else {
                        // Use one connection to DB for the 2 queries
                        connection.query(`DELETE FROM book WHERE id = ${bookId}`, (delErr, delRes) => {
                            connection.release();
                            if (delErr) {
                                result(delErr, null, 500);
                            } else {
                                result(null, selRes[0], 200);
                                cache.del(`book${bookId}`);
                            }
                        });
                    }
                }
            });
        }
    });
};


module.exports = Book;
