// const jwt = require('jsonwebtoken');
// const secretKey = require('../shared/secretKey');
// const User = require('../models/user');


// function auth(req,res,next){
    
//     const bearerheader = req.headers['authorization'];
//     console.log(bearerheader)
//     if(typeof bearerheader !=='undefined'){
//         const bearer = bearerheader.split(' ');
//         const bearerToken = bearer[1];
//         req.token = bearerToken;
//         jwt.verify(req.token,secretKey,(err,authData)=>{
//             if(err){
//                 res.sendStatus(403);
                
//             }
//             else{
                
//                 if(authData.roleId===1){
//                     next();
//                     return;
                    
//                 }
//                 if(authData.roleId===2){
//                     // const url = req.url;
//                     // const arrUrl = url.split('/');
//                     // const id = arrUrl[arrUrl.length-1];

//                     // console.log(req.path)
                     
                    
//                     if(((req.method==='GET')||(req.method==='PUT'))&&((authData.id===parseInt(req.params.id)||(authData.userName===req.params.userName)))){
//                         next();
//                         return;
                        
//                     }
                    
//                     if(((req.method==='DELETE')||(req.method==='PUT'))){
//                         User.getAllUserFavBook(authData.id,(err,favbook,code)=>{
//                             if(err){
//                                 return res.status(code).json(err);
                                
//                             }
//                             else{

//                                 const index = favbook.findIndex(f=> f.id===parseInt(req.params.favId) );
                                
//                                 if(index >-1){
//                                     console.log(req.params.favId ==favbook[index])
//                                     if(req.params.favId ==favbook[index]){
//                                        return next();
                                        
                                        
//                                     }
                                    
//                                 }
//                                 else{
//                                     return res.status(401).send("Unauthorized");
                                    
//                                 }
                                

//                             }
//                         });
                        
//                     }
                  
//                     if((req.method==='POST')){
//                         console.log((req.params.userId ===authData.id))
//                         if((req.url='/login')&&(authData.userName===req.body.userName)){
//                             next();
                           
//                         }
                        
//                         else if((req.params.userId ===authData.id)){
//                             next();
                           
//                         }
//                         else{
//                            res.status(401).send("Unauthorized");
                           
//                         }
//                     }
//                     else{
//                         res.status(401).send("Unauthorized");
                        
//                     }
//                 }
                        
                        
                        
                    
            
                
                
                
//             }
//         });
        
//     }
//     if(bearerheader ==undefined){
//         if((req.method ==='POST')&&(req.url==='/register/')){
//             console.log(req.url)
//             next();
            
            
//         }
//         else{
//              res.status(401).send("Unauthorized");
           
//         }

            
        
//     }
    
    
       
    
// }

// module.exports = auth;





const jwt = require('jsonwebtoken');
const secretKey = require('../shared/secretKey');
const User = require('../models/user');


function auth(req,res,next){
    if (isAllowedRoute(req)) {
        return next();
    }
    const bearerheader = req.headers['authorization'];
    //console.log(bearerheader)
     if(typeof bearerheader !=='undefined'){
        const bearer = bearerheader.split(' ');
        const bearerToken = bearer[1];
        req.token = bearerToken;
        jwt.verify(req.token,secretKey,(err,authData)=>{
            if(err){
                res.sendStatus(403);
                
            }
            else{
                
                if(authData.roleId===1){
                    next();
                    
                   
                    
                }

                if(authData.roleId===2){
                    
                    const url = req.url;
                    const arrUrl = url.split('/');
                    const id = arrUrl[arrUrl.length-1];
                    //console.log(id)
                    //console.log(((req.method==='PUT')||(req.method==='GET'))&&((req.url=='/api/users/favbook/'+id)||(req.url=='/api/users/favbook/isRead/'+id)||((req.url=='/api/users/favbook/favorder/'+id))))
                    if((req.method=='GET')&&(req.url== `/api/books/${id}`)){
                        next();
                        
                        
                    }
                    
                    else if((req.method=='GET')&&(req.url==`/api/books/login/${authData.id}`)){
                       req.params.userId=authData.id;
                        next();
                        
                    }

                    else if(((req.method==='GET')||(req.method==='PUT'))&&(req.url== '/api/users/login/'+authData.id)||(req.url=='/api/users/'+authData.id)){
                        req.params.userId = authData.id;
                        next();
                        
                        
                        
                    }

                    else if((req.method==='GET')&&(req.url=='/api/users/favbook/'+authData.id)){
                        req.params.userId= authData.id;
                        next()
                    }
                    else if(((req.method==='PUT')||(req.method==='POST'))&&((req.url=='/api/users/favbook/'+authData.id+'/'+id)||(req.url=='/api/users/favbook/isRead/'+authData.id+'/'+id)||((req.url=='/api/users/favbook/favorder/'+authData.id+'/'+id)))){
                        req.params.userId = authData.id;
                       
                        next();
                        
                    }
                    else{
                        res.status(401).send("Unauthorized");
                        
                      
                   }
           
                  
                }  
                
            }
        });
        
    }
    if(bearerheader ==undefined){
        console.log(req.url)
        if((req.method ==='GET')&&(req.url==='/api/books/')){
            next();
         
        }
        else{
             res.status(401).send("Unauthorized");
         
        }    
        
    }
    
    
}

function isAllowedRoute(req) {
    // Allowed Routes:
    return ([
        '/api/users/register/',
        '/api/users/login/'
    ].indexOf(req.path) >= 0);
}


module.exports = auth;


















