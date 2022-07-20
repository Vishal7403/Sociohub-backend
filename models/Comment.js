const mongoose=require('mongoose')
const {Schema}=mongoose
const CommentSchema=new Schema({
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'user'
    },
    post:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'post'
    },
    description:{
        type:String,
        required:true
    }
})
const comment=mongoose.model('comment',CommentSchema)
module.exports={comment}