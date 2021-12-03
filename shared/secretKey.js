const path = require('path');
const fs = require('fs');
const secretKey = fs.readFileSync(__dirname +path.sep +"key.txt",'utf-8');
module.exports = secretKey;