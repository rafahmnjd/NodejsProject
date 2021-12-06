const Book = require('../models/book');
const Joi = require('joi');
const express = require('express');
const router = express.Router();
const auth = require('../middlewares/Authorization')

function ValidateModel(book) {
    let schema = Joi.object({
        title : Joi.string().required().max(255),
        authorId : Joi.number().integer().required(),
        ISBN : Joi.string().required().max(13),
        image : Joi.string().required().max(254),
    });
    return schema.validate(book)
}


//Get All
router.get('/',(req, res) => {
    Book.getAll((err, bookRes) => {
        if (err) {
            res.status(500).json({ error: err });
        } else {
            res.status(200).json( bookRes);
        }
    });
});

//Get all book except favbook for user 
router.get('/login/:id',(req, res) => {
    const userId = req.params.id;
    if (isNaN(userId)) // isNaN (is Not a Number) is a function that verifies whether a given string is a normal number
        return res.status(400).send('id should be a number!');

    Book.getAllBookForUserExecptFav(userId, (err, book) => {
        if (err) {
            res.status(500).json({ error: err });
        } else {
             res.status(200).json(book);
                
            }
        
    });
});
//Get by Id

router.get('/:id',(req, res) => {
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
    const book = { title: req.body.title, authorId: req.body.authorId, ISBN:req.body.ISBN, image: req.body.image };
    const bookId = req.params.id;

    if (isNaN(bookId)) { // isNaN (is Not a Number) is a function that ve rifies whether a given string is a normal number
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
