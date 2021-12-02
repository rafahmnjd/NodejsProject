const pool = require('./db');
class Role {
    constructor(role){
        this.id=role.id;
        this.roleName=role.roleName;
    }
}
Role.getAll = (result)=>{
    
    pool.query('SELECT * FROM role ORDER BY id',(err,res)=>{
        if (err) {
            result(err, null);
        } else {
            result(null, res);
        }
    })
}
Role.getById = (id, result)=>{
    pool.query('SELECT * FROM role WHERE id=?',id,(err,res)=>{
        if(err){
            result(err,null);
        }else{
            if(res.length ===0){
                result(null,{});
            }else{
                result(null,res[0]);
            }
        }
    })
}
Role.insert = (roleName,result)=>{
    pool.query('INSERT INTO role (roleName) VALUES (?)',roleName,(err,res)=>{
        if(err){
            result(err,null);
        }else{
            result(null,res);
            // cache.set(`role${roleName}`)
        }
    })

}
Role.updateById = (roleName,id,result)=>{
    pool.query('UPDATE role SET roleName = ? WHERE id = ?',[roleName,id],(err,res)=>{
        if(err){
            result(err,null);
        }else{
            result(null,{id:id,roleName:roleName});
            // cache.del(`role${id}`);
        }
    })
}
Role.deleteById=(id,result)=>{
    pool.getConnection((err,connection)=>{
        if(err){
            result(err,null,500);
            return
        }else{
            pool.query('SELECT * FROM role WHERE id=?',id,(err,res)=>{
                if(err){
                    connection.release();
                    result(err,null,500);
                    return;
                }else{
                    if(res.length==0){
                        connection.release();
                        result({error:'record not found'},null,404);
                        return;
                    }else{
                        pool.query('DELETE FROM role WHERE id=?',id,(err,res1)=>{
                            if(err){
                                connection.release();
                                result(err,null,500);
                                return
                            }else{
                                result(null,{id:id,roleName:res[0].roleName});
                                // cache.del(`role${id}`);
                                return;
                            }
                        })
                    }
                }
            })  
        }        
     
    })
}
module.exports=Role;