const mongoose=require('mongoose');

const noteSchema=new mongoose.Schema({
    title:String,
    note:String
});

// const Note=mongoose.model('note',noteSchema);

// module.exports=Note;

module.exports=noteSchema;