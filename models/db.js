const mysql = require('mysql');
const pool =mysql.createPool({
    connectionLimit:400,
    host:"localhost",
    user:"root",
    password:"",
    database:'readbooks'
});
module.exports=pool;