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