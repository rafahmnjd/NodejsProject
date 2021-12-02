const express = require('express');
const app = express();
app.use(express.json());
app.use(express.urlencoded({
    extended:true
}));

app.use((err, req, res, next) => {
    console.log('Unhandled error: ' + err);
    res.status(500).send("Internal Server Error");
});

app.use('/api/author', require('./routers/author'));
app.use('/api/users',require('./routers/users'));
app.use('/',(req,res)=>{
    res.status(404).json("url not correct")
})


const PORT = process.env.PORT || 3000;
app.listen(PORT, _ => console.log('Listening to port ' + PORT));
