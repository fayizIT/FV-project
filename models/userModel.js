const mongoose =require("mongoose");

const userSchema = mongoose.Schema({

    name:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true
    },
    mobile:{
        type:Number,
        required:true
    },
    password:{
        type:String,
        required:true
    },
    confirmPassword: {
        type: String,
    },
    is_admin:{
        type:String,
        required:true
    },
    is_verified:{
        type:Number,
        default:0,
    },
    token:{
        type:String,
        default:''
    },
    blocked:{
        type:Boolean,
        default:false,
    }

});

module.exports = mongoose.model("User", userSchema);