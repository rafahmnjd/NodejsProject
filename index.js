const express = require('express');
const app = express();
const fs = require('fs');
const https = require('https');
app.use(express.json());
app.use(express.urlencoded({
    extended:true
}));

<<<<<<< HEAD

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
=======
app.use((err, req, res, next) => {
    console.log('Unhandled error: ' + err);
    res.status(500).send("Internal Server Error");
});

app.use('/api/author', require('./routers/author'));
app.use('/api/users',require('./routers/users'));
app.use('/api/roles',require('./routers/roles'));
app.use('/',(req,res)=>{
    res.status(404).json("url not correct")
})


const PORT = process.env.PORT || 3000;
app.listen(PORT, _ => console.log('Listening to port ' + PORT));
>>>>>>> 2f8e9987bfcbd9a3367f3d23708aa52663bf5573
