const jwt = require('jsonwebtoken');
const secretKey = require('../shared/secretKey');
const User = require('../models/user');
function auth(req,res,next){
    
    const bearerheader = req.headers['authorization'];
    console.log(bearerheader)
    if(typeof bearerheader !=='undefined'){
        const bearer = bearerheader.split(' ');
        const bearerToken = bearer[1];
        req.token = bearerToken;
        jwt.verify(req.token,secretKey,(err,authData)=>{
            if(err){
                res.sendStatus(403);
                return;
            }
            else{
                console.log(authData.roleId)
                if(authData.roleId===1){
                    next();
                }
                if(authData.roleId===2){
                    const url = req.url;
                    const arrUrl = url.split('/');
                    const id = arrUrl[arrUrl.length-1];
                    console.log("angel",id)
                    if(((req.method ==='GET')||(req.method==='PUT'))&&((authData.id===parseInt(id)))){
                        next();
                    }
                    if((req.method==='POST')){
                        console.log(authData.use)
                        if((req.url='/login')&&(authData.userName===req.body.userName)){
                            next();
                        }
                        else{
                            res.status(401).send("Unauthorized");
                            return;
                        }
                    }
                    else{
                        res.status(401).send("Unauthorized");
                        return;
                    }
                }
                        
                        
                        
                    
            
                
                
                
            }
        })
        
    }
    if(bearerheader ==undefined){
        if((req.method ==='POST')){
            next();
                
        }else{
                res.status(401).send("Unauthorized");
                return;
            }
    }
    
    
       
    
}
module.exports = auth;