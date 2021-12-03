<<<<<<< HEAD
const Role = require('../models/role');
const Joi = require('joi');
const express = require('express');
const router = express.Router();


function ValidateModel(role) {
    let schema = Joi.object({
        roleName : Joi.string().required().max(50).min(3),
    });
    return schema.validate(role);
}


//Get All
router.get('/', (req, res) => {
    Role.getAll((err, roleRes) => {
        if (err) {
            res.status(500).json({ error: err });
        } else {
            res.status(200).json( roleRes);
        }
    });
});


//Get by Id

router.get('/:id', (req, res) => {
    const id = req.params.id;
    if (isNaN(id)) // isNaN (is Not a Number) is a function that verifies whether a given string is a normal number
        return res.status(400).send('id should be a number!');

    Role.getById(id, (err, role) => {
        if (err) {
            res.status(500).json({ error: err });
        } else {
            if (Object.keys(role).length === 0) { // here user = {}
                res.status(404).json("Not Found");
            } else {
                res.status(200).json(role);
            }
        }
    });
});


//create

router.post('/', (req, res) => {
    const role = { roleName: req.body.roleName };

    const { error } = ValidateModel(role);
    if (error) {
        return res.status(400).send({ error: error });
    }

    Role.createRole(role, (err, roleRes) => {
        if (err) {
            res.status(500).json({ error: err });
        } else {
            res.status(201).json(roleRes);
        }
    });
});



// update

router.put('/:id', (req, res) => {
    const role = { roleName: req.body.roleName };
    const roleId = req.params.id;

    if (isNaN(roleId)) { // isNaN (is Not a Number) is a function that verifies whether a given string is a normal number
        return res.status(400).send('id should be a number!');
    }
    const { error } = ValidateModel(role);
    if (error) {
        return res.status(400).send({ error: error });
    }

    Role.updateRole(roleId, role, (err, roleRes,code) => {
        if (err) {
            res.status(code).json({ error: err });
        } else {
            res.status(200).json(roleRes);
        }
    });
});




//remove

router.delete('/:id', (req, res) => {
    const roleId = req.params.id;
    if (isNaN(roleId)) // isNaN (is Not a Number) is a function that verifies whether a given string is a normal number
        return res.status(400).send('id should be a number!');

    Role.deleteRole(roleId, (err, role, code) => {
        if (err) {
            res.status(code).json({ error: err });
        } else {
            res.status(200).json(role);
        }
    });
});


module.exports = router;

//// END OF ROUTER ////
=======
const Role = require('../models/role');
const express = require('express');
const app = express();
const router = express.Router();

router.get('/',(req,res)=>{
    Role.getAll((err,roles)=>{
        if(err){
            res.status(500).json({error:err})
        }else{
            res.status(200).json(roles)
        }
    })
})
router.get('/:id',(req,res)=>{
    const id=req.body.id;
    Role.getById(id,(err,role)=>{
        if(err){
            res.status(500).json({error:err});
        }else{
            if(Object.keys(role).length === 0){
                res.status(404).json(role)
            }else{
                res.status(200).json(role);
            }
        }
    })
})
router.post('/',(req,res)=>{
    const roleName=req.body.roleName;
    Role.insert(roleName,(err,result)=>{
     if(err){
         res.status(500).json({error:err});
     }else{
         res.status(201).json({id:res.insertId,roleName:roleName})
     }
    })
});
router.put('/:id',(req,res)=>{
    const roleName =req.body.roleName;
    const id =req.params.id;
    Role.updateById(roleName,id,(err,result)=>{
        if(err){
            res.status(500).json({error:err});
        }else{
            res.status(200).json({id:id,roleName:roleName});
        }
    })
})
router.delete('/:id',(req,res)=>{
    const id = req.params.id;
    Role.deleteById(id,(err,result)=>{
        if(err){
            res.status(500).json({error:err});
        }else{
            res.status(200).json(result);
        }
    })
})
module.exports=router;
>>>>>>> 2f8e9987bfcbd9a3367f3d23708aa52663bf5573
