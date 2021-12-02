const express = require('express');
const app = express();
app.use(express.json());
app.use(express.urlencoded({
    extended:true
}));

app.use('/api/users',require('./routers/users'));
app.use('/',(req,res)=>{
    res.status(404).json("url not correct")
})
port = process.env.port || 3000;
app.listen(port,_ =>console.log(`listening to port ${port}`));