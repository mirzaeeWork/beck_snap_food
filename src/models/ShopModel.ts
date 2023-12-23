import { Schema, Types, model } from "mongoose";

const ShopSchema = new Schema({
    name_Shop: { type: String, require: true },
    name_ShopOwner: { type: String, require: true },
    lastName_ShopOwner: { type: String, require: true },
    phoneNumber: { type: String, require: true },
    introduceCode: { type: String },//کد معرف
    imageUrl: { type: String },
    brandImgUrl: { type: String },
    description: { type: String },
    shopActive: { type: Boolean, required: true, default: false },
    shopOpen: { type: Boolean, required: true, default: true },//باز و بسته بودن مغازه
    role: { type: String, require: true, default: "SELLER" },
    OTP: {
        value: { type: String },
        expireIn: { type: Number }
    },
    address:
    {
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

    salesTax: { type: Number },//مالیات را در فروشگاه قرار بده
    mainCategoryId: {
        type: Types.ObjectId,
        ref: "main-Categories", required: true
    },
    subCategoriesIds: [{
        type: Types.ObjectId,
        ref: "sub-categories", required: true
    }],
    sub_subCategoriesIds: [{
        type: Types.ObjectId,
        ref: "sub-categories", required: true
    }],
    ProductPriceAvg:{ type: Number }
},
    { timestamps: true })

const ShopModel = model("shop", ShopSchema)
ShopModel.collection.createIndex({ 'address.geoLocation': '2dsphere' });

export { ShopModel } 
