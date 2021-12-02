const pool = require('./db');
const bcrypt = require('bcrypt');
class User{
    constructor(user){
    this.id = user.id;
    this.userName = user.userName;
    this.email = user.email;
    this.password = user.password;
    this.roleId = user.roleId;
}
}
User.getAll =(result)=>{
    pool.query(`SELECT * FROM user`,(err,res)=>{
        if(err){
            result(err,null);
            return;

        }
        else{
            result(null,res);
            return;
        }
    });
}
User.getById =(userId,result)=>{
    pool.query(`SELECT * FROM user WHERE id =${userId}`,(err,res)=>{
        if(err){
            result(err,null,500);
            return;
        }
        else{
            if(res.length ===0){
                result(null,{},404);
                return;
            }
            else{
                result(null,res[0],200);
                return;
            }
        }
    });
};
User.getByName =(userName,result)=>{
    pool.query(`SELECT * FROM user WHERE userName ="${userName}"`,(err,res)=>{
        if(err){
            result(err,null,500);
            return;
        }
        else{
            if(res.length===0){
                result(null,{},404);
                return;
            }
            else{
                result(null,res[0],200);
                return;
            }
        }
    });
};

User.rgister =(userName,email,password,result)=>{
    bcrypt.hash(password,10,(err,hash)=>{
        if(err){
            result(err,null);
            return;
        }
        else{
            //pool.query(`INSERT INTO user(userName,email,password)VALUES(?,?,?)`,(err,res)=>{
            pool.query(`INSERT INTO user SET userName ="${userName}",email="${email}",password ="${hash}"`,(err,res)=>{
                if(err){
                    result(err,null);
                    return;
                }
                else{

                    result(null,Object.assign({id:res.insertId,userName,email:email,password:password}));
                    return;
                }
            });    

        }
    });
};
User.login =(userName,password,result)=>{
    pool.query(`SELECT * FROM user WHERE userName ="${userName}"`,(err,res)=>{
        if(err){
            result(err,null,500);
            return;
        }
        else{
            if(res.length===0){
                result({error:"password or userName are not correct"},null,400);
                return;
            }
            else{
                bcrypt.compare(password,res[0].password,(err,isCorecct)=>{
                    if(err){
                        result(err,null,500);
                        return;
                    }
                    else{
                        if(!isCorecct){
                            result({error:"password or username is not correct"},null,400);
                            return;
                        }
                        else{
                            result(null,res[0],200);
                            return;
                        }
                    }
                });
            }
        }
    });
};

User.updateUser=(userId,userName,email,result)=>{
    pool.query(`UPDATE user SET userName="${userName}",email="${email}"WHERE id=${userId}`,(err,res)=>{
        if(err){
            result(err,null,500);
            return;
        }
        else{
            
            result(null,{id:userId,userName:userName},200);
            return;
            
        }
    });
};

User.removeUser=(userId,result)=>{
    pool.getConnection((err,connection)=>{
        if(err){
            result(err,null,500);   
            return;
        }
        else{
            connection.query(`SELECT * FROM user WHERE id =${userId}`,(errGet,resGet)=>{
                if(errGet){
                    connection.release();
                    result(errGet,null,500);
                    return;

                }
                else{
                    if(resGet.length ===0){
                        connection.release();
                        result({error:"user is not exist"},null,404);
                        return;
                    }
                    else{
                        connection.query(`DELETE FROM user WHERE id =${userId}`,(errDel,resDel)=>{
                            connection.release();
                            if(errDel){
                                result(errDel,null,500);
                                return;
                            }
                            else{
                                result(null,resGet,200);
                                return;
                            }
                        });
                    }
                }
            });
        }
    });
};

User.changePassword =(userId,newPassword,oldPassword,result)=>{
    pool.getConnection((err,connection)=>{
        if(err){
            result(err,null,500);
            return;
        }
        else{
            connection.query(`SELECT * FROM user WHERE id =${userId}`,(errGet,resGet)=>{
                if(errGet){
                    connection.release();
                    result(errGet,null,500);
                    return;
                }
                else{
                    if(resGet.length===0){
                        connection.release();
                        result({error:"user is not exist"},null,404);
                        return;
                    }
                    else{
                        bcrypt.compare(oldPassword,resGet[0].password,(err,isCorecct)=>{
                            if(err){
                                connection.release();
                                result(err,null,500);
                                return;
                            }
                            else{
                                if(!isCorecct){
                                    connection.release();
                                    result({error:"password is not correct"},null,400);
                                    return;

                                }
                                else{
                                    bcrypt.hash(newPassword,10,(err,hash)=>{
                                        if(err){
                                            connection.release();
                                            result(err,null,500);
                                            return;
                                        }
                                        else{
                                    
                                            connection.query(`UPDATE user SET password ="${hash}"WHERE id =  ${userId}`,(errUp,resUp)=>{
                                                connection.release();
                                                if(errUp){
                                                    result(errUp,null,500);
                                                    return;
                                                }
                                                else{
                                                    result(null,true,204);
                                                    return;
                                                }
                                            });
                                        }
                                    });
                                    
                                }
                            }
                        });
                    }

                }
            });
        }
    });
};

User.getRole =(userId,result)=>{
    pool.query(`SELECT roleName FROM role r INNER JOIN user u ON r.id = u.roleId WHERE u.id =${userId}`,(err,res)=>{
        if(err){

            result(err,null,500);
            return;
        }
        else{
            if(res.length ===0){
                result({error:"user is not exist"},null,404);
                return;
            }
            else{
                result(null,res,200);
                return;
            }
        }
    })
}
module.exports = User;