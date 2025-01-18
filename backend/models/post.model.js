import mongoose from 'mongoose';

const PostSchema = new mongoose.Schema({
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        required:true
    },
    text:{
        type:String
    },
    img:{
        type:String
    },
    likes:[
       { 
        type:mongoose.Schema.Types.ObjectId,
        ref:'User'
       }
    ], 
    comments:[{
        text:{
            type:String,
            required:true
        },
        user:{
             type:mongoose.Schema.Types.ObjectId,
            ref:'User',
            required:true
        }
    }]
},{versionKey:false,timestamps:true});

const Posts = mongoose.model('Posts',PostSchema);
export default Posts;