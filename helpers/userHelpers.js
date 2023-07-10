const Category = require("../models/categoryModel");
const User = require('../models/userModel');
const Order = require("../models/orderModel");
const Cart = require("../models/cartModel");
var Address = require("../models/addressesModel");

const Razorpay = require("razorpay");
const { ObjectId } = require("mongodb");
var instance = new Razorpay({
    key_id: 'rzp_test_lttgGofXL0RV96',
    key_secret: 'tjY5jtZTUF0hWyBS9M4E2EMI',
});




module.exports={

verifyOnlinePayment: (paymentData) => {

console.log(paymentData);

    return new Promise((resolve, reject) => {
     console.log("From here......");
        const crypto = require('crypto'); // Requiring crypto Module here for generating server signature for payments verification
         console.log(crypto);
        let razorpaySecretKey = 'tjY5jtZTUF0hWyBS9M4E2EMI';
         console.log(razorpaySecretKey);
        let hmac = crypto.createHmac('sha256', razorpaySecretKey); // Hashing Razorpay secret key using SHA-256 Algorithm
     console.log(hmac);
        hmac.update(paymentData['razorpayServerPaymentResponse[razorpay_order_id]'] + '|' + paymentData['razorpayServerPaymentResponse[razorpay_payment_id]']);
        // Updating the hash (re-hashing) by adding Razprpay payment Id and order Id received from client as response

        let serverGeneratedSignature = hmac.digest('hex');
        // Converted the final hashed result into hexa code and saving it as server generated signature

        let razorpayServerGeneratedSignatureFromClient = paymentData['razorpayServerPaymentResponse[razorpay_signature]']

          console.log(razorpayServerGeneratedSignatureFromClient,"helooooooooooooo");
        if (serverGeneratedSignature === razorpayServerGeneratedSignatureFromClient) {
            // Checking that is the signature generated in our server using the secret key we obtained by hashing secretkey,orderId & paymentId is same as the signature sent by the server 

            console.log("Payment Signature Verified");
            resolve()

        } else {

            console.log("Payment Signature Verification Failed");

            reject()

        }

    })

},

updateOnlineOrderPaymentStatus: (ordersCollectionId, onlinePaymentStatus) => {
    return new Promise(async (resolve, reject) => {
        if (onlinePaymentStatus) {
            const orderUpdate = await Order.findByIdAndUpdate({ _id: new ObjectId(ordersCollectionId) }, { $set: { orderStatus: "Placed" } }).then(() => {
                resolve()
            });

        } else {
            const orderUpdate = await Order.findByIdAndUpdate({ _id: new ObjectId(ordersCollectionId) }, { $set: { orderStatus: "Failed" } }).then(() => {
                resolve()
            })
        }
    })
    
},



}