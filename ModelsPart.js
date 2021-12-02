

//// START OF  Author MODEL////
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
        if (err) {
            result(err, null);
        } else {
            result(null, res);
        }
    });
};

//Get by Id
Author.getById = (authorId, result) => {
    cacheValue = cache.get(`author${authorId}`);
    if (cacheValue == undefined) {
        pool.query('SELECT * FROM author WHERE id = ?', authorId, (err, res) => {
            if (err) {
                result(err, null);
            } else {
                if (res.length === 0) { // The author is not found for the given id
                    result(null, {});
                } else {
                    cache.set(`author${authorId}`, res);
                    result(null, res);
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
        if (err) {
            result(err, null);
        } else {
            result(null, { id: res.insertId, name: author.name });
        }
    });
};

// update

Author.updateAuthor = (authorId,author, result) => {
    pool.query(`UPDATE author  SET name= "${author.name}" WHERE id = ${authorId}`,(err, res) => {
        if (err) {
            result(err, null,500);
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
        if (conErr) {
            result(conErr, null, 500);
        } else {
            connection.query(`SELECT * FROM author WHERE id = ${authorId}`, (selErr, selRes) => {
                if (selErr) {
                    connection.release();
                    return result(selErr, null, 500);
                } else {
                    if (selRes.length === 0) { // The author is not found for the given id
                        result({ error: 'Record not found' }, null, 404);
                        connection.release();
                    } else {
                        // Use one connection to DB for the 2 queries
                        connection.query(`DELETE FROM author WHERE id = ${authorId}`, (delErr, delRes) => {
                            connection.release();
                            if (delErr) {
                                result(delErr, null, 500);
                            } else {
                                result(null, selRes, 200);
                                cache.del(`author${authorId}`);
                            }
                        });
                    }
                }
            });
        }
    });
};


module.exports = Author;

//// END OF MODEL ////



/////////////////////////////////////////////////////////////////////




//// START OF  Author ROUTER////

const Author = require('../models/author');
const Joi = require('joi');
const express = require('express');
const router = express.Router();


function ValidateModel(author) {
    let schema = Joi.object({
        name : Joi.required(),
    });
    return schema.validate(author);
}


//Get All
router.get('/', (req, res) => {
    Author.getAll((err, authorRes) => {
        if (err) {
            res.status(500).json({ error: err });
        } else {
            res.status(200).json( authorRes);
        }
    });
});


//Get by Id

router.get('/:id', (req, res) => {
    const id = req.params.id;
    if (isNaN(id)) // isNaN (is Not a Number) is a function that verifies whether a given string is a normal number
        return res.status(400).send('id should be a number!');

    Author.getById(id, (err, author) => {
        if (err) {
            res.status(500).json({ error: err });
        } else {
            if (Object.keys(author).length === 0) { // here user = {}
                res.status(404).json("Not Found");
            } else {
                res.status(200).json(author);
            }
        }
    });
});


//create

router.post('/', (req, res) => {
    const author = { name: req.body.name };

    const { error } = ValidateModel(author);
    if (error) {
        return res.status(400).send({ error: error });
    }

    Author.createAuthor(author, (err, authorRes) => {
        if (err) {
            res.status(500).json({ error: err });
        } else {
            res.status(201).json(authorRes);
        }
    });
});



// update

router.put('/:id', (req, res) => {
    const author = { name: req.body.name };
    const authorId = req.params.id;

    if (isNaN(authorId)) { // isNaN (is Not a Number) is a function that verifies whether a given string is a normal number
        return res.status(400).send('id should be a number!');
    }
    const { error } = ValidateModel(author);
    if (error) {
        return res.status(400).send({ error: error });
    }

    Author.updateAuthor(authorId, author, (err, authorRes,code) => {
        if (err) {
            res.status(code).json({ error: err });
        } else {
            res.status(200).json(authorRes);
        }
    });
});




//remove

router.delete('/:id', (req, res) => {
    const authorId = req.params.id;
    if (isNaN(authorId)) // isNaN (is Not a Number) is a function that verifies whether a given string is a normal number
        return res.status(400).send('id should be a number!');

    Author.deleteAuthor(authorId, (err, author, code) => {
        if (err) {
            res.status(code).json({ error: err });
        } else {
            res.status(200).json(author);
        }
    });
});


module.exports = router;

//// END OF ROUTER ////

///////////////////////////////////////////////////////////////////////////////////////////////////////////////


//// START OF  Book MODEL////
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
                    cache.set(`book${bookId}`, res);
                    result(null, res);
                }
            }
        });
    } else {
        result(null, cacheValue);
    }
};

//create
Book.createBook = (book, result) => {
    pool.query("INSERT INTO book (title, authorId, ISBN, image) VALUES ( ? , ? , ? , ? )", book.title, book.authorId, book.ISBN, book.image, (err, res) => {
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
                                result(null, selRes, 200);
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

//// END OF MODEL ////



/////////////////////////////////////////////////////////////////////




//// START OF  Book ROUTER////

const Book = require('../models/book');
const Joi = require('joi');
const express = require('express');
const router = express.Router();


function ValidateModel(book) {
    let schema = Joi.object({
        title : Joi.required(),
        authorId : Joi.required(),
        ISBN : Joi.required(),
        image : Joi.required(),
    });
    return schema.validate(book);
}


//Get All
router.get('/', (req, res) => {
    Book.getAll((err, bookRes) => {
        if (err) {
            res.status(500).json({ error: err });
        } else {
            res.status(200).json( bookRes);
        }
    });
});


//Get by Id

router.get('/:id', (req, res) => {
    const id = req.params.id;
    if (isNaN(id)) // isNaN (is Not a Number) is a function that verifies whether a given string is a normal number
        return res.status(400).send('id should be a number!');

    Book.getById(id, (err, book) => {
        if (err) {
            res.status(500).json({ error: err });
        } else {
            if (Object.keys(book).length === 0) { // here user = {}
                res.status(404).json("Not Found");
            } else {
                res.status(200).json(book);
            }
        }
    });
});


//create

router.post('/', (req, res) => {
    const book = { title: req.body.title, authorId: req.body.authorId, ISBN: req.body.ISBN, image: req.body.image };

    const { error } = ValidateModel(book);
    if (error) {
        return res.status(400).send({ error: error });
    }

    Book.createBook(book, (err, bookRes) => {
        if (err) {
            res.status(500).json({ error: err });
        } else {
            res.status(201).json(bookRes);
        }
    });
});



// update

router.put('/:id', (req, res) => {
    const book = { title: req.body.title, authorId: req.body.authorId, ISBN: req.body.ISBN, image: req.body.image };
    const bookId = req.params.id;

    if (isNaN(bookId)) { // isNaN (is Not a Number) is a function that verifies whether a given string is a normal number
        return res.status(400).send('id should be a number!');
    }
    const { error } = ValidateModel(book);
    if (error) {
        return res.status(400).send({ error: error });
    }

    Book.updateBook(bookId, book, (err, bookRes,code) => {
        if (err) {
            res.status(code).json({ error: err });
        } else {
            res.status(200).json(bookRes);
        }
    });
});




//remove

router.delete('/:id', (req, res) => {
    const bookId = req.params.id;
    if (isNaN(bookId)) // isNaN (is Not a Number) is a function that verifies whether a given string is a normal number
        return res.status(400).send('id should be a number!');

    Book.deleteBook(bookId, (err, book, code) => {
        if (err) {
            res.status(code).json({ error: err });
        } else {
            res.status(200).json(book);
        }
    });
});


module.exports = router;

//// END OF ROUTER ////

///////////////////////////////////////////////////////////////////////////////////////////////////////////////


//// START OF  Role MODEL////
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
                    cache.set(`role${roleId}`, res);
                    result(null, res);
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
                                result(null, selRes, 200);
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

//// END OF MODEL ////



/////////////////////////////////////////////////////////////////////




//// START OF  Role ROUTER////

const Role = require('../models/role');
const Joi = require('joi');
const express = require('express');
const router = express.Router();


function ValidateModel(role) {
    let schema = Joi.object({
        roleName : Joi.required(),
    });
    return schema.validate(role);
}


//Get All
router.get('/', (req, res) => {
    Role.getAll((err, roleRes) => {
        if (err) {
            res.status(500).json({ error: err });
        } else {
            res.status(200).json( roleRes);
        }
    });
});


//Get by Id

router.get('/:id', (req, res) => {
    const id = req.params.id;
    if (isNaN(id)) // isNaN (is Not a Number) is a function that verifies whether a given string is a normal number
        return res.status(400).send('id should be a number!');

    Role.getById(id, (err, role) => {
        if (err) {
            res.status(500).json({ error: err });
        } else {
            if (Object.keys(role).length === 0) { // here user = {}
                res.status(404).json("Not Found");
            } else {
                res.status(200).json(role);
            }
        }
    });
});


//create

router.post('/', (req, res) => {
    const role = { roleName: req.body.roleName };

    const { error } = ValidateModel(role);
    if (error) {
        return res.status(400).send({ error: error });
    }

    Role.createRole(role, (err, roleRes) => {
        if (err) {
            res.status(500).json({ error: err });
        } else {
            res.status(201).json(roleRes);
        }
    });
});



// update

router.put('/:id', (req, res) => {
    const role = { roleName: req.body.roleName };
    const roleId = req.params.id;

    if (isNaN(roleId)) { // isNaN (is Not a Number) is a function that verifies whether a given string is a normal number
        return res.status(400).send('id should be a number!');
    }
    const { error } = ValidateModel(role);
    if (error) {
        return res.status(400).send({ error: error });
    }

    Role.updateRole(roleId, role, (err, roleRes,code) => {
        if (err) {
            res.status(code).json({ error: err });
        } else {
            res.status(200).json(roleRes);
        }
    });
});




//remove

router.delete('/:id', (req, res) => {
    const roleId = req.params.id;
    if (isNaN(roleId)) // isNaN (is Not a Number) is a function that verifies whether a given string is a normal number
        return res.status(400).send('id should be a number!');

    Role.deleteRole(roleId, (err, role, code) => {
        if (err) {
            res.status(code).json({ error: err });
        } else {
            res.status(200).json(role);
        }
    });
});


module.exports = router;

//// END OF ROUTER ////

///////////////////////////////////////////////////////////////////////////////////////////////////////////////


//// START OF  User MODEL////
const pool = require('./pool');
const NodeCache = require("node-cache");
const cache = new NodeCache({ stdTTL: 120, checkperiod: 600 });

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
    pool.query('SELECT * FROM user  ORDER BY id', (err, res) => {
        if (err) {
            result(err, null);
        } else {
            result(null, res);
        }
    });
};

//Get by Id
User.getById = (userId, result) => {
    cacheValue = cache.get(`user${userId}`);
    if (cacheValue == undefined) {
        pool.query('SELECT * FROM user WHERE id = ?', userId, (err, res) => {
            if (err) {
                result(err, null);
            } else {
                if (res.length === 0) { // The user is not found for the given id
                    result(null, {});
                } else {
                    cache.set(`user${userId}`, res);
                    result(null, res);
                }
            }
        });
    } else {
        result(null, cacheValue);
    }
};

//create
User.createUser = (user, result) => {
    pool.query("INSERT INTO user (userName, email, password, roleId) VALUES ( ? , ? , ? , ? )", user.userName, user.email, user.password, user.roleId, (err, res) => {
        if (err) {
            result(err, null);
        } else {
            result(null, { id: res.insertId, userName: user.userName, email: user.email, password: user.password, roleId: user.roleId });
        }
    });
};

// update

User.updateUser = (userId,user, result) => {
    pool.query(`UPDATE user  SET userName= "${user.userName}", email= "${user.email}", password= "${user.password}", roleId= "${user.roleId}" WHERE id = ${userId}`,(err, res) => {
        if (err) {
            result(err, null,500);
        } else if(res.affectedRows===0){
            result({ error: 'Record not found' }, null, 404);
        } else {
            cache.del(`user${userId}`);
            result(null, { id: userId, userName: user.userName, email: user.email, password: user.password, roleId: user.roleId });
        }
    });
};

//remove
User.deleteUser = (userId, result) => {
    pool.getConnection((conErr, connection) => {
        if (conErr) {
            result(conErr, null, 500);
        } else {
            connection.query(`SELECT * FROM user WHERE id = ${userId}`, (selErr, selRes) => {
                if (selErr) {
                    connection.release();
                    return result(selErr, null, 500);
                } else {
                    if (selRes.length === 0) { // The user is not found for the given id
                        result({ error: 'Record not found' }, null, 404);
                        connection.release();
                    } else {
                        // Use one connection to DB for the 2 queries
                        connection.query(`DELETE FROM user WHERE id = ${userId}`, (delErr, delRes) => {
                            connection.release();
                            if (delErr) {
                                result(delErr, null, 500);
                            } else {
                                result(null, selRes, 200);
                                cache.del(`user${userId}`);
                            }
                        });
                    }
                }
            });
        }
    });
};


module.exports = User;

//// END OF MODEL ////



/////////////////////////////////////////////////////////////////////




//// START OF  User ROUTER////

const User = require('../models/user');
const Joi = require('joi');
const express = require('express');
const router = express.Router();


function ValidateModel(user) {
    let schema = Joi.object({
        userName : Joi.required(),
        email : Joi.required(),
        password : Joi.required(),
        roleId : Joi.required(),
    });
    return schema.validate(user);
}


//Get All
router.get('/', (req, res) => {
    User.getAll((err, userRes) => {
        if (err) {
            res.status(500).json({ error: err });
        } else {
            res.status(200).json( userRes);
        }
    });
});


//Get by Id

router.get('/:id', (req, res) => {
    const id = req.params.id;
    if (isNaN(id)) // isNaN (is Not a Number) is a function that verifies whether a given string is a normal number
        return res.status(400).send('id should be a number!');

    User.getById(id, (err, user) => {
        if (err) {
            res.status(500).json({ error: err });
        } else {
            if (Object.keys(user).length === 0) { // here user = {}
                res.status(404).json("Not Found");
            } else {
                res.status(200).json(user);
            }
        }
    });
});


//create

router.post('/', (req, res) => {
    const user = { userName: req.body.userName, email: req.body.email, password: req.body.password, roleId: req.body.roleId };

    const { error } = ValidateModel(user);
    if (error) {
        return res.status(400).send({ error: error });
    }

    User.createUser(user, (err, userRes) => {
        if (err) {
            res.status(500).json({ error: err });
        } else {
            res.status(201).json(userRes);
        }
    });
});



// update

router.put('/:id', (req, res) => {
    const user = { userName: req.body.userName, email: req.body.email, password: req.body.password, roleId: req.body.roleId };
    const userId = req.params.id;

    if (isNaN(userId)) { // isNaN (is Not a Number) is a function that verifies whether a given string is a normal number
        return res.status(400).send('id should be a number!');
    }
    const { error } = ValidateModel(user);
    if (error) {
        return res.status(400).send({ error: error });
    }

    User.updateUser(userId, user, (err, userRes,code) => {
        if (err) {
            res.status(code).json({ error: err });
        } else {
            res.status(200).json(userRes);
        }
    });
});




//remove

router.delete('/:id', (req, res) => {
    const userId = req.params.id;
    if (isNaN(userId)) // isNaN (is Not a Number) is a function that verifies whether a given string is a normal number
        return res.status(400).send('id should be a number!');

    User.deleteUser(userId, (err, user, code) => {
        if (err) {
            res.status(code).json({ error: err });
        } else {
            res.status(200).json(user);
        }
    });
});


module.exports = router;

//// END OF ROUTER ////

///////////////////////////////////////////////////////////////////////////////////////////////////////////////




