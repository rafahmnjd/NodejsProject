const express = require('express');
const router = express.Router();
const User = require('../models/user');
const Joi = require('joi');
const jwt = require('jsonwebtoken');

router.get('/',(req,res)=>{
    User.getAll((err,users)=>{
        if(err){
            res.status(500).json({error:err});
        }
        else{
            res.status(200).json(users);
        }
    });
});

router.get('/:id',(req,res)=>{

    const userId = req.params.id;
    if(isNaN(userId)){
        res.status(400).send('should be a number');
        return;
    }
    User.getById(userId,(err,user,code)=>{
        if(err){
            res.status(code).json({error:err});
        }
        else{
            if(Object.keys(user).length===0){
                res.status(code).json(user);
            }
            else{
                res.status(code).json(user);
            }
        }
    });
});


router.post('/login/:userName',(req,res)=>{
    const userName = req.params.userName;
    const {error}=validationUserName(req.params);
    if(error){
        res.status(400).send({error:error});
        return;
    }
    User.getByName(userName,(err,user,code)=>{
        if(err){
            res.status(code).json({error:err});
        }
        else{
            if(Object.keys(user).length===0){
                res.status(code).json(user);
            }
            else{
                res.status(code).json(user);
            }
        }
    });
});

router.post('/register',(req,res)=>{
    const userName =req.body.userName;
    const email = req.body.email;
    const password = req.body.password;
    const {error}=validationRegister(req.body);
    if(error){
        res.status(400).send({error:error});
        return;
    }
    User.rgister(userName,email,password,(err,user)=>{
        if(err){
            res.status(500).json({error:err});
        }
        else{
            res.status(201).json(user);
        }
    });
        
    

});

router.post('/login',(req,res)=>{
    const userName=req.body.userName;
    const password = req.body.password;
    const {error}=validationLogin(req.body);
    if(error){
        res.status(400).send({error:error});
        return;
    }
    User.login(userName,password,(err,user,code)=>{
        if(err){
            res.status(code).json({error:err});
        }
        else{
            User.getRole(user.id,(err,role,code)=>{
                if(err){
                    res.status(code).json({error:err});
                }
                else{
                    
                    jwt.sign(Object.assign({id:user.id,email:user.email,userName:user.userName,role:role.roleName}),secretKey,{"expiresIn":600},(err,token)=>{
                        if(err){
                            console.log(err)
                            res.status(500).json({error:err});
                            return;
                        }
                        else{
                            console.log(token)
                            res.status(code).json({token});
                            return;                      
                       
                        }
                        
                     });
                }
            });
            
        }
    });
});
router.put('/:id',(req,res)=>{
    const userId = req.params.id;
    const userName=req.body.userName;
    const email = req.body.email;
    if(isNaN(userId)){
        res.status(400).send("should be a number");
        return;
    }
    const {error}=validationUpdateUser(req.body);
    if(error){
        res.status(400).send({eror:error});
        return;
    }
    
    User.updateUser(userId,userName,email,(err,user)=>{
        if(err){
            res.status(500).json({error:err});
        }
        else{
            res.status(200).json(user);
        }
    })
});

router.delete('/:id',(req,res)=>{
    const userId = req.params.id;
    if(isNaN(userId)){
        res.status(400).send("should be a number");
        return;
    }
    User.removeUser(userId,(err,user,code)=>{
        if(err){
            res.status(code).json({error:err});

        }
        else{
            res.status(code).json(user);
        }
    });
});
router.put('/login/:id',(req,res)=>{
    const userId = req.params.id;
    const oldPassword = req.body.oldPassword;
    const  newPassword = req.body.newPassword;
    if(isNaN(userId)){
        res.status(400).send('should be a number');
        return;
    }
    const {error}=validationChangePassword(req.body);
    if(error){
        res.status(400).json({error:error});
        return;
    }
    User.changePassword(userId,newPassword,oldPassword,(err,result,code)=>{
        if(err){
            res.status(code).json(err);

        }
        else{
            res.status(code).json(result);
        }
    });


});

router.get('/login/:id',(req,res)=>{

    const userId = req.params.id;
    if(isNaN(userId)){
        res.status(400).send('should be a number');
        return;
    }
    User.getRole(userId,(err,role,code)=>{
        if(err){
            res.status(code).json({error:err});
        }
        else{
            if(Object.keys(role).length===0){
                res.status(code).json(role);
            }
            else{
                res.status(code).json(role);
            }
        }
    });
});

function validationChangePassword(user){
    const schema = Joi.object({
        oldPassword :Joi.string().max(60).min(3).required(),
        newPassword :Joi.string().max(60).min(3).required()
    });
    return schema.validate(user);
}

function validationUpdateUser(user){
    const schema = Joi.object({
     userName:Joi.string().min(3).max(50).required(),
     email:Joi.string().email().required().max(150).min(10)  
    });
    return schema.validate(user);

}
function validationLogin(user){
    const schema = Joi.object({
        userName:Joi.string().min(3).max(50).required(),
        password:Joi.string().required().min(3).max(60)
    });
    return schema.validate(user);
}
function validationRegister(user){
    const schema = Joi.object({
        userName:Joi.string().min(3).max(50).required(),
        email:Joi.string().email().required().max(150).min(5),
        password:Joi.string().min(3).max(60).required()
    }) ;
    return schema.validate(user);
}
function validationUserName(userName){
    const schema = Joi.object({
        userName:Joi.string().max(50).min(3).required()
    });
    return schema.validate(userName);
}
module.exports = router;