const express = require('express');
const app = express();
const fs = require('fs');
const https = require('https');
app.use(express.json());
app.use(express.urlencoded({
    extended:true
}));


const options ={
    cert :fs.readFileSync('./configs/cert.pem','utf-8'),
    key:fs.readFileSync('./configs/key.pem','utf-8')
};
app.use('/api/users', require('./routers/users'));
app.use('/api/roles', require('./routers/roles'));
app.use('/api/authors', require('./routers/authors'));
app.use('/api/books', require('./routers/books'));
app.use('/',(req,res)=>{
    res.status(404).json("url not correct")
});
port = process.env.port || 3000;
//https.createServer(options,app).listen(port,_ =>console.log(`listening to port ${port}`));
app.listen(port,_ =>console.log(`listening to port ${port}`));