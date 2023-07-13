// const mongoose = require('mongoose')

// const coupon = new mongoose.Schema({
// coupenCode:{
//     type:String,
//     required:true
// },
// couponAmount:{
//     type:Number,
//     required:true
// },
// description:{
//     type:String,
//     required:false
// },
// image:{
//     type:String,
//     required:false,

// },
// startDate:{
//     type:Date,
//     required:true
// },
// expiryDate:{
//     type:Date,
//   required:true
// },
// minimumAmount:{
//     type:Number,
//     required:true
// },
// status:{
//     type:String,
//    default:'Active'
// },
// })

// module.exports=mongoose.model('Coupon',coupon)


const mongoose = require('mongoose');

const couponSchema =  new mongoose.Schema({
    couponCode:{
        type:String,
        required:true
    },
    couponDescription:{
        type:String,
        required:false
    },
    discountPercentage:{
        type:Number,
        required:true
    },
    maxDiscountAmount:{
        type:Number,
        required:true
    },
    minOrderValue:{
        type:Number,
        required:true
    },
    validFor:{
        type:Number,
        required:true
    },
    activeCoupon:{
        type:Boolean,
        default:false
    },
    usageCount:{
        type:Number,
        
    },
    createdOn:{
        type:Date,
        required:true
    }
   

})

module.exports = mongoose.model('Coupon', couponSchema)