const mysql = require('mysql');
<<<<<<< HEAD

const pool =mysql.createPool({
    connectionLimit:400,
    host:"localhost",
    user:"root",
    password:"",
    database:'readbooks'
});
<<<<<<<< HEAD:models/pool.js
========

>>>>>>>> 2f8e9987bfcbd9a3367f3d23708aa52663bf5573:models/db.js
module.exports=pool;
=======
const pool = mysql.createPool({
    connectionLimit: 100,
    host:"localhost",
    user: "root",
    password:"",
    database: "readbooks"
});

module.exports = pool;
>>>>>>> 2f8e9987bfcbd9a3367f3d23708aa52663bf5573
