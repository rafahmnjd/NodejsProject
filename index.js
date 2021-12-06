const express = require('express');
const app = express();
const fs = require('fs');
const https = require('https');
app.use(express.json());
app.use(express.urlencoded({
    extended:true
}));

const auth = require('./middlewares/Authorization')
app.use(auth);

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