const User = require('../models/userModel');
const moment = require("moment-timezone");
const Order = require("../models/orderModel");
const mongoose=require("mongoose")
const ObjectId = mongoose.Types.ObjectId;
const Wallet = require("../models/walletModel");
const pdfPrinter = require("pdfmake");
const fs = require('fs')
module.exports = {

loadingDashboard: async (req, res) => {
    return new Promise(async (resolve, reject) => {
        try {
            const users = await User.find({}).lean().exec();
            const totaluser = users.length-1;

            const totalSales = await Order.aggregate([
                {
                    $match: {
                        orderStatus: { $nin: ["cancelled"] },

                    },
                },
                {
                    $group: {
                        _id: null,
                        totalSum: { $sum: "$orderValue" },
                    },
                },
            ]);

            const salesbymonth = await Order.aggregate([
                {
                    $match: {
                        orderStatus: { $nin: ["cancelled"] },
                    },
                },
                {
                    $group: {
                        _id: { $month: "$date" },
                        totalSales: { $sum: "$orderValue" },
                    },
                },
                {
                    $sort: {
                        _id: 1,
                    },
                },
            ]);

            const paymentMethod = await Order.aggregate([
                {
                  $match: {
                    orderStatus: { $in: ["Placed", "Delivered","Preparing food"] }, // Exclude "cancelled" status
                  },
                },
                {
                  $group: {
                    _id: "$paymentMethod", // Group by paymentMethod only
                    totalOrderValue: { $sum: "$orderValue" },
                    count: { $sum: 1 },
                  },
                },
              ]);

            const currentYear = new Date().getFullYear();
            const previousYear = currentYear - 1;

            const yearSales = await Order.aggregate([
                // Match orders within the current year or previous year
                {
                    $match: {
                        orderStatus: { $nin: ["cancelled"] },
                        date: {
                            $gte: new Date(`${previousYear}-01-01`),
                            $lt: new Date(`${currentYear + 1}-01-01`),
                        },
                    },
                },
                // Group orders by year and calculate total sales
                {
                    $group: {
                        _id: {
                            $year: "$date",
                        },
                        totalSales: {
                            $sum: "$orderValue",
                        },
                    },
                },
            ])
                .exec();


            // to get today sales

            console.log(yearSales, 'yearSales');

            const todaysalesDate = new Date();
            const startOfDay = new Date(
                todaysalesDate.getFullYear(),
                todaysalesDate.getMonth(),
                todaysalesDate.getDate(),
                0,
                0,
                0,
                0
            );
            const endOfDay = new Date(
                todaysalesDate.getFullYear(),
                todaysalesDate.getMonth(),
                todaysalesDate.getDate(),
                23,
                59,
                59,
                999
            );

            const todaySales = await Order.aggregate([
                {
                    $match: {
                        orderStatus: { $in: ["pending", "Delivered", "Placed","Preparing food"] },

                        date: {
                            $gte: startOfDay, // Set the current date's start time
                            $lt: endOfDay,
                        },
                    },
                },
                {
                    $group: {
                        _id: null,
                        totalAmount: { $sum: "$orderValue" },
                    },
                },
            ]);

            const dashBoardDetails = {
                totaluser,
                totalSales,
                salesbymonth,
                paymentMethod,
                yearSales,
                todaySales
            }

            resolve(dashBoardDetails)



        } catch (error) {
            reject(error)
        }
    })

},

orderSuccess: () => {
    return new Promise(async (resolve, reject) => {
        try {
            const order = await Order
                .find({ orderStatus: { $in: ["Placed", "Delivered", "Preparing food"] } })
                .populate('userId')
                .sort({ date: -1 })
                .lean()
                .exec();



            const orderHistory = order.map(history => {
                let createdOnIST = moment(history.date)
                    .tz('Asia/Kolkata')
                    .format('DD-MM-YYYY h:mm A');

                return { ...history, date: createdOnIST, userName: history.userId.name };
            });

            const total = await Order.aggregate([
                {
                    $match: {
                        orderStatus: { $in: ["Placed", "Delivered", "Preparing food"] },
                    },
                },
                {
                    $group: {
                        _id: null,
                        totalAmount: { $sum: "$orderValue" },
                    },
                },
                {
                    $sort: {
                        totalAmount: 1,
                    },
                },
            ]);

            console.log(total, 'totallllllllllllll');
            const orderDetails = {
                orderHistory,
                total
            }

            resolve(orderDetails)
        } catch (error) {
            reject(error)
        }
    })
},

salesToday: () => {
    return new Promise(async (resolve, reject) => {
        try {
            const todaysales = new Date();
            const startOfDay = new Date(
                todaysales.getFullYear(),
                todaysales.getMonth(),
                todaysales.getDate(),
                0,
                0,
                0,
                0
            );
            const endOfDay = new Date(
                todaysales.getFullYear(),
                todaysales.getMonth(),
                todaysales.getDate(),
                23,
                59,
                59,
                999
            );
            const order = await Order.find({
                orderStatus: { $nin: ["cancelled"] },
                date: {
                    $gte: startOfDay,
                    $lt: endOfDay
                }
            })
                .populate('userId')
                .sort({ date: -1 });


            const orderHistory = order.map(history => {
                const createdOnIST = moment(history.date).tz('Asia/Kolkata').format('DD-MM-YYYY h:mm A');
                return { ...history._doc, date: createdOnIST, userName: history.userId.name };
            });



            const total = await Order.aggregate([
                {
                    $match: {

                        orderStatus: { $in: ["Placed", "Delivered", "Preparing food"] },

                        date: {
                            $gte: startOfDay, // Set the current date's start time
                            $lt: endOfDay,
                        },
                    },
                },
                {
                    $group: {
                        _id: null,
                        totalAmount: { $sum: "$orderValue" },
                    },
                },
            ]);

            console.log(total, 'total from helper');
            console.log(orderHistory, 'order form helper');

            const salesToday = {
                orderHistory,
                total
            }

            if (order) {
                resolve(salesToday)
            }
            else {
                resolve("No sales registerd today")
            }
        } catch (error) {
            reject(error)
        }
    })
},

weeklySales: () => {
    return new Promise(async (resolve, reject) => {
        try {
            const currentDate = new Date();

            // Calculate the start and end dates of the current week
            const startOfWeek = new Date(
                currentDate.getFullYear(),
                currentDate.getMonth(),
                currentDate.getDate() - currentDate.getDay()
            );
            const endOfWeek = new Date(
                currentDate.getFullYear(),
                currentDate.getMonth(),
                currentDate.getDate() + (6 - currentDate.getDay()),
                23,
                59,
                59,
                999
            );

            const order = await Order.find({
                orderStatus: { $nin: ["cancelled"] },
                date: {
                    $gte: startOfWeek,
                    $lt: endOfWeek
                }
            })
                .populate('userId')
                .sort({ date: -1 });


            const orderHistory = order.map(history => {
                const createdOnIST = moment(history.date).tz('Asia/Kolkata').format('DD-MM-YYYY h:mm A');
                return { ...history._doc, date: createdOnIST, userName: history.userId.name };
            });

            const total = await Order.aggregate([
                {
                    $match: {
                        orderStatus: { $in: ["Placed", "Delivered", "Preparing food"] },
                        date: {
                            $gte: startOfWeek,
                            $lt: endOfWeek,
                        },
                    },
                },
                {
                    $group: {
                        _id: null,
                        totalAmount: { $sum: "$orderValue" },
                    },
                },
            ]);

            const weeklySales = {
                orderHistory,
                total
            }
            resolve(weeklySales)

        } catch (error) {
            reject(error)
        }
    })
},


monthlySales: () => {
    return new Promise(async (resolve, reject) => {
        try {
            const thisMonth = new Date().getMonth() + 1;
            const startofMonth = new Date(
                new Date().getFullYear(),
                thisMonth - 1,
                1,
                0,
                0,
                0,
                0
            );
            const endofMonth = new Date(
                new Date().getFullYear(),
                thisMonth,
                0,
                23,
                59,
                59,
                999
            );

            const order = await Order.find({
                orderStatus: { $nin: ["cancelled"] },
                date: {
                    $lt: endofMonth,
                    $gte: startofMonth,
                }
            })
                .populate('userId')
                .sort({ date: -1 });


            const orderHistory = order.map(history => {
                const createdOnIST = moment(history.date).tz('Asia/Kolkata').format('DD-MM-YYYY h:mm A');
                return { ...history._doc, date: createdOnIST, userName: history.userId.name };
            });

            const total = await Order.aggregate([
                {
                    $match: {
                        orderStatus: { $in: ["Placed", "Delivered", "Preparing food"] },
                        date: {
                            $lt: endofMonth,
                            $gte: startofMonth,
                        },
                    },
                },
                {
                    $group: {
                        _id: null,
                        totalAmount: { $sum: "$orderValue" },
                    },
                },
            ]);

            const monthlySales = {
                orderHistory,
                total
            }

            resolve(monthlySales)



        } catch (error) {
            reject(error)
        }
    })
},

yearlySales: () => {
    return new Promise(async (resolve, reject) => {
        try {
            const today = new Date().getFullYear();
            const startofYear = new Date(today, 0, 1, 0, 0, 0, 0);
            const endofYear = new Date(today, 11, 31, 23, 59, 59, 999);


            const order = await Order.find({
                orderStatus: { $nin: ["cancelled"] },
                date: {
                    $lt: endofYear,
                    $gte: startofYear,
                }
            })
                .populate('userId')
                .sort({ date: -1 });


            const orderHistory = order.map(history => {
                const createdOnIST = moment(history.date).tz('Asia/Kolkata').format('DD-MM-YYYY h:mm A');
                return { ...history._doc, date: createdOnIST, userName: history.userId.name };
            });

            const total = await Order.aggregate([
                {
                    $match: {
                        orderStatus: { $in: ["Placed", "Delivered", "Preparing food"] },
                        date: {
                            $lt: endofYear,
                            $gte: startofYear,
                        },
                    },
                },
                {
                    $group: {
                        _id: null,
                        totalAmount: { $sum: "$orderValue" },
                    },
                },
            ]);

            const yearlySales = {
                orderHistory,
                total
            }

            resolve(yearlySales)


        } catch (error) {
            reject(error)
        }
    })
},

salesWithDate: (req, res) => {
    return new Promise(async (resolve, reject) => {
        try {
            const date = new Date();
            const fromDate = new Date(req.body.fromDate);
            const toDate = new Date(req.body.toDate);
            fromDate.setHours(0, 0, 0, 0); // Set time to 00:00:00.000
            toDate.setHours(23, 59, 59, 999);

            const order = await Order.find({
                orderStatus: { $nin: ["cancelled"] },
                date: {
                    $lt: toDate,
                    $gte: fromDate,
                }
            })
                .populate('userId')
                .sort({ date: -1 });


            const orderHistory = order.map(history => {
                const createdOnIST = moment(history.date).tz('Asia/Kolkata').format('DD-MM-YYYY h:mm A');
                return { ...history._doc, date: createdOnIST, userName: history.userId.name };
            });

            const total = await Order.aggregate([
                {
                    $match: {
                        orderStatus: { $in: ["Placed", "Delivered", "Preparing food"] },
                        date: {
                            $lt: toDate,
                            $gte: fromDate,
                        },
                    },
                },
                {
                    $group: {
                        _id: null,
                        totalAmount: { $sum: "$orderValue" },
                    },
                },
            ]);

            const salesWithDate = {
                orderHistory,
                total
            }

            resolve(salesWithDate)
        } catch (error) {
            console.log('salesWithDate helper error')
            reject(error)
        }
    })
},

salesPdf: (req, res) => {
    return new Promise(async (resolve, reject) => {
        try {
            let startY = 150;
            const writeStream = fs.createWriteStream("order.pdf");
            const printer = new pdfPrinter({
                Roboto: {
                    normal: "Helvetica",
                    bold: "Helvetica-Bold",
                    italics: "Helvetica-Oblique",
                    bolditalics: "Helvetica-BoldOblique",
                },
            });

            const order = await Order
                .find({ orderStatus: { $in: ["Placed", "Delivered", "Preparing food"] } })
                .populate('userId')
                .exec();

            const totalAmount = await Order.aggregate([
                {
                    $match: {
                        orderStatus: { $nin: ["cancelled"] },
                    },
                },
                {
                    $group: {
                        _id: null,
                        totalAmount: { $sum: "$orderValue" },
                    },
                },
            ]);

            const dateOptions = { year: "numeric", month: "long", day: "numeric" };
            // Create document definition
            const docDefinition = {
                content: [
                    { text: "Juco Berry", style: "header" },
                    { text: "\n" },
                    { text: "Order Information", style: "header1" },
                    { text: "\n" },
                    { text: "\n" },
                ],
                styles: {
                    header: {
                        fontSize: 25,
                        alignment: "center",
                    },
                    header1: {
                        fontSize: 12,
                        alignment: "center",
                    },
                    total: {
                        fontSize: 18,
                        alignment: "center",
                    },
                },
            };

            // Create the table data
            const tableBody = [
                ["Index", "Date", "User", "Status", "Method", "Amount"], // Table header
            ];

            for (let i = 0; i < order.length; i++) {
                const data = order[i];
                const formattedDate = new Intl.DateTimeFormat(
                    "en-US",
                    dateOptions
                ).format(new Date(data.date));
                tableBody.push([
                    (i + 1).toString(), // Index value
                    formattedDate,
                    data.userId.name,
                    data.orderStatus,
                    data.paymentMethod,
                    data.orderValue,
                ]);
            }

            const table = {
                table: {
                    widths: ["auto", "auto", "auto", "auto", "auto", "auto"],
                    headerRows: 1,
                    body: tableBody,
                },
            };

            // Add the table to the document definition
            docDefinition.content.push(table);
            docDefinition.content.push([
                { text: "\n" },
                { text: `Total: ${totalAmount[0]?.totalAmount || 0}`, style: "total" },
            ]);
            // Generate PDF from the document definition
            const pdfDoc = printer.createPdfKitDocument(docDefinition);

            // Pipe the PDF document to a write stream
            pdfDoc.pipe(writeStream);

            // Finalize the PDF and end the stream
            pdfDoc.end();

            writeStream.on("finish", () => {
                res.download("order.pdf", "order.pdf");
            });
        } catch (error) {
            console.log('pdfSales helper error')
            reject(error)
        }
    })
}


}
