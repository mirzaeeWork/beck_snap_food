"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductModel = void 0;
const mongoose_1 = require("mongoose");
const ProductSchema = new mongoose_1.Schema({
    name: { type: String, require: true },
    description: { type: String, require: true },
    shopId: {
        type: mongoose_1.Types.ObjectId,
        ref: "shop", required: true
    },
    productsGroupId: {
        type: mongoose_1.Types.ObjectId,
        ref: "products-group", required: true
    },
    imageUrl: { type: String, required: true },
    priceDescription: [
        {
            name: { type: String },
            price: { type: Number, require: true },
        },
    ],
    isAvailable: { type: Boolean, required: true, default: true },
    isActive: { type: Boolean, required: true, default: false },
    discount: { type: Number },
    remainderCcount: { type: Number },
}, { timestamps: true });
const ProductModel = (0, mongoose_1.model)("product", ProductSchema);
exports.ProductModel = ProductModel;
