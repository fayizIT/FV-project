const Category = require("../models/categoryModel");
const User = require('../models/userModel');
const Order = require("../models/orderModel");
const Cart = require("../models/cartModel");
var Address = require("../models/addressesModel");
const Wallet = require("../models/walletModel");
const moment = require("moment-timezone");

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




  getCartValue: (userId) => {

        return new Promise(async (resolve, reject) => {
            try {
                const productDetails = await Cart.findOne({ user_id: userId }).lean();
                console.log(productDetails, 'productDetails');
    
                // Calculate the new subtotal for all products in the cart
                const subtotal = productDetails.products.reduce((acc, product) => {
                    return acc + product.total;
                }, 0);
    
                console.log(subtotal, 'subtotal');
    
                if (subtotal) {
                    resolve(subtotal)
                } else {
                    resolve(false);
                }
            } catch (error) {
                reject(error)
            }
           
        })
    },

    walletBalance: (userId) => {
        console.log("wallet balancee controller");
        return new Promise(async (resolve, reject) => {
          try {
            const walletBalance = await Wallet.findOne({ userId });
            const walletAmount = walletBalance.walletAmount;
            resolve(walletAmount);
          } catch (error) {
            reject(error);
          }
        });
      },
    

    updatewallet: (userId, orderId) => {
        console.log("reached helper for wallet");
        return new Promise(async (resolve, reject) => {
          try {
            const orderdetails = await Order.findOne({ _id: orderId });
            console.log(orderdetails, "orderdetails");
            const wallet = await Wallet.findOne({ userId: userId });
            console.log(wallet, "wallet is this");
            if (wallet) {
              const updatedWalletAmount =
                wallet.walletAmount - orderdetails.orderValue;
              const updatedWallet = await Wallet.findOneAndUpdate(
                { userId: userId },
                { $set: { walletAmount: updatedWalletAmount } }
              );
              console.log(updatedWalletAmount, "updatedWalletAmount");
    
              resolve(updatedWalletAmount);
            } else {
              reject("wallet not find");
            }
          } catch (error) {
            reject(error);
          }
        });
      },


      getWalletDetails: (userId) => {
        return new Promise(async (resolve, reject) => {
            try {
                const walletDetails = await Wallet.findOne({ userId: userId }).lean()
                // console.log(walletDetails,'walletDetailsvvvvvvvvvvvvvv');


                resolve(walletDetails)
            } catch (error) {
                reject(error);
            }
        })
    },

    creditOrderDetails: (userId) => {
        return new Promise(async (resolve, reject) => {
            try {
                const orderDetails = await Order.find({
                    userId: userId,
                    $or: [{ paymentMethod: 'ONLINE' }, { paymentMethod: 'WALLET' }],
                    orderStatus: 'cancelled'
                }).lean();

                const orderHistory = orderDetails.map(history => {
                    let createdOnIST = moment(history.date)
                        .tz('Asia/Kolkata')
                        .format('DD-MM-YYYY h:mm A');

                    return { ...history, date: createdOnIST };
                });

                resolve(orderHistory);
            } catch (error) {
                reject(error);
            }
        });
    },

    debitOrderDetails: (userId) => {
        return new Promise(async (resolve, reject) => {
            try {
                const orderDetails = await Order.find({
                    userId: userId,
                    paymentMethod: 'WALLET',
                    $or: [{ orderStatus: 'Placed' }, { orderStatus: 'Delivered' },{orderStatus:'Preparing food'}],
                  
                }).lean();

                const orderHistory = orderDetails.map(history => {
                    let createdOnIST = moment(history.date)
                        .tz('Asia/Kolkata')
                        .format('DD-MM-YYYY h:mm A');

                    return { ...history, date: createdOnIST };
                });

                resolve(orderHistory);
            } catch (error) {
                reject(error);
            }
        });
    }

    };



