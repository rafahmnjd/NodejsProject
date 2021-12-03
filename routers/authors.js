
const Author = require('../models/author');
const Joi = require('joi');
const express = require('express');
const router = express.Router();


function ValidateModel(author) {
    let schema = Joi.object({
        name : Joi.string().required().max(50),
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
                res.status(404).json("Record not found");
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
