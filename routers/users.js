
const User = require('../models/user');
const Joi = require('joi');
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const secretKey = require('../shared/secretKey');
const auth = require('../middlewares/Authorization');






//Get All
router.get('/',(req, res) => {
    User.getAll((err, userRes) => {
        if (err) {
           res.status(500).json({ error: err });
        } else {
            res.status(200).json( userRes);
        }
    });
});


//Get by Id

router.get('/:id',(req, res) => {
    const id = req.params.id;
    if (isNaN(id)) // isNaN (is Not a Number) is a function that verifies whether a given string is a normal number
        return res.status(400).send('id should be a number!');

    User.getById(id, (err, user) => {
        if (err) {
            res.status(500).json({ error: err });
        } else {
            if (Object.keys(user).length === 0) { // here user = {}
                res.status(404).json("Not Found");
            } else {
                res.status(200).json(user);
            }
        }
    });
});


//create

// update

router.put('/:id',(req, res) => {
    const user = { userName: req.body.userName, email: req.body.email };
    const userId = req.params.id;

    if (isNaN(userId)) { // isNaN (is Not a Number) is a function that verifies whether a given string is a normal number
        return res.status(400).send('id should be a number!');
    }
    const { error } = validationUpdateUser(user);
    if (error) {
        return res.status(400).send({ error: error });
    }

    User.updateUser(userId, user, (err, userRes,code) => {
        if (err) {
            res.status(code).json({ error: err });
        } else {
            res.status(200).json(userRes);
        }
    });
});




//remove

router.delete('/:id',(req, res) => {
    const userId = req.params.id;
    if (isNaN(userId)) // isNaN (is Not a Number) is a function that verifies whether a given string is a normal number
        return res.status(400).send('id should be a number!');

    User.deleteUser(userId, (err, user, code) => {
        if (err) {
            res.status(code).json({ error: err });
        } else {
            res.status(200).json(user);
        }
    });
});

// get by name
// router.get('/login/:userName',(req,res)=>{
//     const userName = req.params.userName;
//     const {error}=validationUserName(req.params);
//     if(error){
//         res.status(400).send({error:error});
       
//     }
//     User.getByName(userName,(err,user,code)=>{
//         if(err){
//             res.status(code).json({error:err});
//         }
//         else{
//             if(Object.keys(user).length===0){
//                 res.status(code).json(user);
//             }
//             else{
//                 res.status(code).json(user);
//             }
//         }
//     });
// });

router.post('/register',auth,(req,res)=>{
     const user={userName :req.body.userName,
                 email : req.body.email,
                 password :req.body.password,
                 roleId:req.body.roleId};
                 console.log(user)
    const {error}=ValidateModel(user);
    if(error){
       return  res.status(400).send({error:error});
        
    }
    User.register(user,(err,user)=>{
        if(err){
             res.status(500).json({error:err});
        }
        else{
            res.status(204).json(user);
        }
    });
        
    

});



//login
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
            jwt.sign(Object.assign({id:user.id,email:user.email,userName:user.userName,roleId:user.roleId}),secretKey,{expiresIn:30000},(err,token)=>{
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
});

//change password
router.put('/login/:id',(req,res)=>{
    const userId = req.params.id;
    const oldPassword = req.body.oldPassword;
    const newPassword = req.body.newPassword;
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
//get role
// router.get('/login/:id',(req,res)=>{

//     const roleId = req.params.id;
//     if(isNaN(roleId)){
//         res.status(400).send('should be a number');
//         return;
//     }
//     User.getRole(roleId,(err,role,code)=>{
//         if(err){
//             res.status(code).json({error:err});
//         }
//         else{
//             if(Object.keys(role).length===0){
//                 res.status(code).json(role);
//             }
//             else{
//                 res.status(code).json(role);
//             }
//         }
//     });
// });


router.get('/favbooks/',(req,res)=>{
    User.getAllUsersFavBook((err,fav,code)=>{
        if(err){
            res.status(code).json({error:err});
        }
        else{
            res.status(code).json(fav);
        }
    });
});

router.get('/favbook/:userId',(req,res)=>{
    const userId = req.params.userId;
    if(isNaN(userId)){
        res.status(400).send('should be a number');
        return;
    }
    User.getAllUserFavBook(userId,(err,favUser,code)=>{
        if(err){
            res.status(code).json({error:err});
        }
        else{
            res.status(code).json(favUser);
        }
    });

});


// router.post('/login/favbook/:userId/:bookId',(req,res)=>{
//     const order = {userId:req.params.userId,bookId:req.params.bookId};
//     User.createUserFavBook(order,(err,favbook)=>{
//         if(err){
//             res.status(500).json({error:err});
//         }
//         else{
//             res.status(204).json(favbook);
//         }
//     });
// });



router.post('/favbook/:userId/:bookId',(req,res)=>{
    const order = {userId:req.params.userId,bookId:req.params.bookId};
    User.createUserFavBook(order,(err,favbook,code)=>{
        if(err){
            res.status(code).json({error:err});
        }
        else{
            res.status(code).json(favbook);
        }
    });
});

router.put('/favbook/favOrder/:userId/:favId',(req,res)=>{
    const order ={id:req.params.favId,userId:req.params.userId,favOrder:req.body.favOrder};
   User.updateUserFavOrder(order,(err,favbook)=>{
       if(err){
            res.status(500).json({error:err});
       }
       else{
           res.status(204).json(favbook);
       }
   }) ;
});

router.put('/favbook/isRead/:userId/:favId',(req,res)=>{
    const order ={id:req.params.favId,userId:req.params.userId,isReadr:req.body.isRead};
   User.updateUserIsRead(order,(err,favbook)=>{
       if(err){
            res.status(500).json({error:err});
       }
       else{
           res.status(204).json(favbook);
       }
   }) ;
});

// router.delete('/login/favbook/:userId/:favId',(req,res)=>{
//     const favId = req.params.favId;
//     const userId = req.params.userId;
//     User.deleteUserFavBook(userId,favId,(err,favbook)=>{
//         if(err){
//             res.status(500).json({error:err});
//         }
//         else{
//             res.status(204).json(favbook);
//         }
//     });
// });

router.put('/favbook/:userId/:favId',(req,res)=>{
    const favId = req.params.favId;
    const userId = req.params.userId;
    User.deleteUserFavBook(userId,favId,(err,favbook)=>{
        if(err){
            res.status(500).json({error:err});
        }
        else{
            res.status(204).json(favbook);
        }
    });
});

//validation

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
function ValidateModel(user){
    const schema = Joi.object({
        userName:Joi.string().min(3).max(50).required(),
        email:Joi.string().email().required().max(150).min(5),
        password:Joi.string().min(3).max(60).required(),
        roleId:Joi.number().integer().positive().required()
    }) ;
    return schema.validate(user);
}
function ValidateRegister(user){
    const schema = Joi.object({
        userName:Joi.string().min(3).max(50).required(),
        email:Joi.string().email().required().max(150).min(5),
        password:Joi.string().min(3).max(60).required(),
        
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