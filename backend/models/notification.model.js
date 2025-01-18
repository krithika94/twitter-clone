import mongoose from 'mongoose';

const NotificationSchema = new mongoose.Schema(
{
    from:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    },
    to:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User", 
        required:true
    },
    type:{
        type:String,
        required:true,
        enum:["follow","like","post"]
    },
    read:{
        type:Boolean,
        default:false
    }

},{versionKey:false,timestamps:true});

const Notification = mongoose.model("Notification",NotificationSchema );
export default Notification;