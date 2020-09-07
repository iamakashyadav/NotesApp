const mongoose=require('mongoose');
const noteSchema=require('./note');


const userSchema=new mongoose.Schema({
    name:String,
    email:String,
    password:String,
    notes:[noteSchema]
});

const User=mongoose.model('user',userSchema);

module.exports=User;