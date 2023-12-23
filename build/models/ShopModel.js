"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ShopModel = void 0;
const mongoose_1 = require("mongoose");
const ShopSchema = new mongoose_1.Schema({
    name_Shop: { type: String, require: true },
    name_ShopOwner: { type: String, require: true },
    lastName_ShopOwner: { type: String, require: true },
    phoneNumber: { type: String, require: true },
    introduceCode: { type: String },
    imageUrl: { type: String },
    brandImgUrl: { type: String },
    description: { type: String },
    shopActive: { type: Boolean, required: true, default: false },
    shopOpen: { type: Boolean, required: true, default: true },
    role: { type: String, require: true, default: "SELLER" },
    OTP: {
        value: { type: String },
        expireIn: { type: Number }
    },
    address: {
        cityName: { type: String, require: true },
        addressChoose: { type: String, require: true },
        addressDetails: { type: String, require: true },
        geoLocation: {
            type: {
                type: String,
                default: "Point"
            },
            coordinates: {
                type: [Number],
                required: true,
            },
        },
    },
    salesTax: { type: Number },
    mainCategoryId: {
        type: mongoose_1.Types.ObjectId,
        ref: "main-Categories", required: true
    },
    subCategoriesIds: [{
            type: mongoose_1.Types.ObjectId,
            ref: "sub-categories", required: true
        }],
    sub_subCategoriesIds: [{
            type: mongoose_1.Types.ObjectId,
            ref: "sub-categories", required: true
        }],
    ProductPriceAvg: { type: Number }
}, { timestamps: true });
const ShopModel = (0, mongoose_1.model)("shop", ShopSchema);
exports.ShopModel = ShopModel;
ShopModel.collection.createIndex({ 'address.geoLocation': '2dsphere' });
