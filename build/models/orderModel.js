"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderModel = void 0;
const mongoose_1 = require("mongoose");
const OrderSchema = new mongoose_1.Schema({
    userPhoneNumber: { type: String, required: true },
    shopId: {
        type: mongoose_1.Types.ObjectId,
        ref: "shop", required: true
    },
    addressId: {
        type: mongoose_1.Types.ObjectId,
        ref: "user", required: true
    },
    orderProducts: [{
            productId: { type: mongoose_1.Types.ObjectId, ref: "product", required: true },
            price: { type: Number, ref: "product", required: true },
            count: { type: Number, required: true },
            discount: { type: Number },
        }],
    prductPriceSum: { type: Number, required: true },
    shippingCost: { type: Number, required: true },
    paymentMethod: { type: String, required: true },
    orderSum: { type: Number, required: true },
    paymentStatus: { type: String, required: true },
    date: { type: String, required: true },
    paymentOnline: { type: Number, required: true },
}, {
    timestamps: true
});
exports.OrderModel = (0, mongoose_1.model)("order", OrderSchema);
