import { Schema, Types, model } from "mongoose";


const ProductSchema = new Schema({
    name: { type: String, require: true },
    description: { type: String, require: true },
    shopId:{
        type: Types.ObjectId,
        ref: "shop", required: true
    },
    productsGroupId: {
        type: Types.ObjectId,
        ref: "products-group", required: true
    },
    imageUrl:{ type: String ,required:true},
    priceDescription: [
        {
            name: { type: String },//برای یک نفر
            price: { type: Number, require: true },
        },
    ],
    isAvailable:{ type: Boolean, required: true, default: true },
    isActive: { type: Boolean, required: true, default: false },
    //for discount
    discount: { type: Number },
    //for foodParty
    remainderCcount: { type: Number },
},
    { timestamps: true });

const ProductModel = model("product", ProductSchema);
export { ProductModel };