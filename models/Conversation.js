const mongoose=require('mongoose')
const {Schema}=mongoose
const conversationSchema=new Schema({
    members:{
        type:Array
    },
},{
    timestamps:true
})
const conversation=mongoose.model('conversation',conversationSchema)
module.exports={conversation}
