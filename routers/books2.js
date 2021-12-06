const Book = require('../models/book');
const Joi = require('joi');
const express = require('express');
const router = express.Router();
const gzip = require('zlib').createGzip();
const uzip = require('zlib').createGunzip();
const multer = require("multer");
const fs = require("fs");
const diskPath = 'storage/';
const clientPath = 'client/images/';
const reletvPath = '/images/';
const upload = multer({ dest: `../${diskPath}` });




function ValidateModel(book) {
    let schema = Joi.object({
        title: Joi.string().required().max(255),
        authorId: Joi.number().integer().required(),
        ISBN: Joi.string().required().max(13),
        image: Joi.allow(),
    });
    return schema.validate(book)
}


//Get All
router.get('/', (req, res) => {
    Book.getAll((err, bookRes) => {
        if(err) {
            res.status(500).json({ error: err });
        } else {
            res.status(200).json(bookRes);
        }
    });
});


//Get by Id

router.get('/:id', (req, res) => {
    const id = req.params.id;
    if(isNaN(id)) // isNaN (is Not a Number) is a function that verifies whether a given string is a normal number
        return res.status(400).send('id should be a number!');

    Book.getById(id, (err, book) => {
        if(err) {
            res.status(500).json({ error: err });
        } else {
            if(Object.keys(book).length === 0) { // here user = {}
                res.status(404).json("Not Found");
            } else {
                decompressImage(book.image, (delerr, newName) => {
                    if(delerr) {
                        console.log(delerr);
                    }
                });
                res.status(200).json(book);
            }
        }
    });
});


//create

router.post('/', upload.single("image"), (req, res, next) => {
    if(!req.file) {
        console.log("No file received");
        return res.status(400).send({ error: "No file received" })
    } else {
        console.log('file received');
        compressImage(req.file, (err, filename) => {
            if(err) {
                res.status(500).json({ error: err });
            } else {
                const book = { title: req.body.title, authorId: req.body.authorId, ISBN: req.body.ISBN, image: reletvPath + filename };
                const { error } = ValidateModel(book);
                if(error) {
                    return res.status(400).send({ error: error });
                }
                Book.createBook(book, (err, bookRes) => {
                    if(err) {
                        res.status(500).json({ error: err });
                    } else {
                        res.status(201).json(bookRes);
                    }
                });
            }
        });

    }
});



// update

router.put('/:id', upload.single("image"), (req, res) => {

    const bookId = req.params.id;
    if(isNaN(bookId)) { // isNaN (is Not a Number) is a function that ve rifies whether a given string is a normal number
        return res.status(400).send('id should be a number!');
    }
    const book1 = { title: req.body.title, authorId: req.body.authorId, ISBN: req.body.ISBN, image: req.image };
    const { error } = ValidateModel(book1);
    if(error) {
        console.log(error);
        return res.status(400).send({ error: error });
    } else {
        var book = book1;
        Book.getImageById(bookId, (err, img) => {
            if(err) {
                return res.status(500).send({ error: err });
            } else {
                if(!req.file) {
                    book.image = reletvPath + img.image;
                    Book.updateBook(bookId, book, (err, bookRes, code) => {
                        if(err) {
                            res.status(code).json({ error: err });
                        } else {
                            res.status(200).json(bookRes);
                        }
                    });
                }
                else {
                    // console.log(img)
                    if(img) {
                        deleteImage(img.image);
                    }
                    compressImage(req.file, (err, filename) => {
                        if(err) {
                            res.status(500).json({ error: err });
                        } else {
                            book.image = reletvPath + filename;
                            Book.updateBook(bookId, book, (err, bookRes, code) => {
                                if(err) {
                                    res.status(code).json({ error: err });
                                } else {
                                    res.status(200).json(bookRes);
                                }
                            });
                        }
                    });
                }
            }
        });

    }
});




//remove

router.delete('/:id', (req, res) => {
    const bookId = req.params.id;
    if(isNaN(bookId)) // isNaN (is Not a Number) is a function that verifies whether a given string is a normal number
        return res.status(400).send('id should be a number!');

    Book.deleteBook(bookId, (err, book, code) => {
        if(err) {
            res.status(code).json({ error: err });
        } else {
            deleteImage(book.image);
            res.status(200).json(book);
        }
    });
});


function compressImage(img, result) {
    fs.access(diskPath, (error) => {
        if(error) {
            console.log(error);
            fs.mkdirSync(diskPath);
        }
    });
    var time = new Date();
    var ext = img.originalname.split('.');
    console.log(ext);
    ext = ext[ext.length - 1];
    const filename = time.getTime() + "." + ext;
    try {
        const readStream =
            fs.createReadStream(img.path);
        // console.log(readStream);
        const writeStream =
            fs.createWriteStream(diskPath + filename + ".gz");
        // console.log(writeStream);
        readStream.pipe(gzip).pipe(writeStream);
        result(null, filename);
        console.log(filename+" was stored successfully");
    } catch(stremerr) {
        console.log(stremerr);
        result(stremerr, null);
    }
    
}

function deleteImage(fileName) {
    var split = fileName.split('/');
    imageName = split[split.length - 1];
    fs.access(diskPath + imageName + ".gz", (err) => {
        if(!err) {
            fs.unlink(diskPath + imageName + ".gz", (err) => {
                if(err) {
                    console.error(err)
                    return
                }
                console.log(`${imageName} was deleted`);
            });
        }
    });
    fs.access(clientPath + imageName, (err) => {
        if(!err) {
            fs.unlink(clientPath + imageName, (err) => {
                if(err) {
                    console.error(err)
                    
                } else {
                    console.log(`${imageName} was deleted`);
                }

            });
        }
        else {
            console.error(err)
        }
    });
}

function decompressImage(fileName, result) {

    fs.access(clientPath, (error) => {
        if(error) {
            console.error(error)
            fs.mkdirSync(clientPath);
        }
    });
    var split = fileName.split('/');
    console.log("splits=" + split,split.length);

    if(split.length==1) {
        console.log('no valide file name');
        result({ err:"no valide file name"},null)
    }
    else {
        newName = split[split.length - 1];
        console.log(newName, fileName);

        try {
            console.log(diskPath + newName + ".gz");
            const readStream =
                fs.createReadStream(diskPath + newName + ".gz");
            const writeStream =
                fs.createWriteStream(clientPath + newName);
            readStream.pipe(uzip).pipe(writeStream);
        } catch(stremerr) {
            console.log(stremerr);
            return result(stremerr, null);
        }
        result(null, newName);
    }

}
module.exports = router;

