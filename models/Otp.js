const mongoose=require('mongoose')
const {Schema}=mongoose
const OtpSchema=new Schema({
    email:{
        type:String,
        required:true
    },
    code:{
        type:Number,
        required:true
    }
    ,
    expireAt:{
        type:Date,
        required:true
    }
})
OtpSchema.index( { "expireAt": 1 }, { expireAfterSeconds: 0 } )
const Otp=mongoose.model('otp',OtpSchema)
module.exports={Otp}