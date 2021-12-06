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
//get book for user execpt his favbook
// SELECT id,title FROM book b WHERE  EXISTS (SELECT * FROM user u WHERE  EXISTS(SELECT * FROM userbooksfav f WHERE f.userId!=u.id AND f.bookId != b.id))
// SELECT id,title FROM book b WHERE NOT EXISTS (SELECT * FROM user u WHERE NOT EXISTS(SELECT * FROM userbooksfav f WHERE f.userId=u.id AND f.bookId = b.id))
Book.getAllBookForUserExecptFav=(userId,result)=>{
    var sql = `SELECT id,title FROM book b WHERE NOT EXISTS (SELECT distinct * FROM userbooksfav f WHERE f.userId =${userId} AND f.bookId = b.id)` ;
    pool.query(sql,(err,res)=>{
        if(err){
            result(err,null)
            
        }
        else{
            
            result(null,res);
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
    
    pool.query("INSERT INTO book (title, authorId, ISBN, image) VALUES ( ? , ? , ? , ? )", [book.title, book.authorId, book.ISBN,book.image], (err, res) => {
        if (err) {
            result(err, null);
        } else {
            result(null, { id: res.insertId, title: book.title, authorId: book.authorId, ISBN: book.ISBN, image: book.image });
        }
    });
};


// Book.createBook = (book, result) => {
//     pool.getConnection((err,conn)=>{
//         if(err){
//             result(err,null,500);
//         }
//         else{
//             var sql='SELECT * FROM book  WHERE image =?';
//             conn.query(sql,inputValues.image_name,function (err, data, fields) {
//             if(err) {
//                 result(err,null,500);
//             }
//             if(data.length>1){
//                 var msg = inputValues.image_name + " is already exist";
//                 result(msg,null,400);
//             }else{ 
//                 // save users data into databases
//                 var sql = 'INSERT INTO book SET image=?';
//             conn.query(sql, inputValues, function (err, data) {
//                 if (err) {
//                     result(null,{ id: res.insertId, image: book.image },200)
//                 }
                
//             });
           
        
            
//         }
//     });
    
    
// };

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
