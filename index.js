const express = require('express');
const app = express();
const fs = require('fs');
// const multer = require("multer");

const https = require('https');
app.use(express.json());
app.use(express.urlencoded({
    extended:true
}));

const auth = require('./middlewares/Authorization');
app.use(auth);
// app.use(multer);
const options ={
    cert :fs.readFileSync('./configs/cert.pem','utf-8'),
    key:fs.readFileSync('./configs/key.pem','utf-8')
};



app.use(express.static("./client"));
app.use(express.static("./client/images"));


app.use((err, req, res, next) => {
    console.log('Unhandled error: ' + err);
    res.status(500).send("Internal Server Error");
    next();
});

app.use('/api/users', require('./routers/users'));
app.use('/api/roles', require('./routers/roles'));
app.use('/api/authors', require('./routers/authors'));
app.use('/api/books', require('./routers/books'));
app.use('/',(req,res)=>{
    res.status(404).json("url not correct")
});
port = process.env.port || 3000;

app.listen(port,_ =>console.log(`listening to port ${port}`));

module.exports =app;
