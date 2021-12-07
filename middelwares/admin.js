function admin(req, res, next){
    if(req.roleId === 1) {
        next();
    }
    else {
        res.status(401).send("Unauthorized");
    }
}

module.exports = admin;
