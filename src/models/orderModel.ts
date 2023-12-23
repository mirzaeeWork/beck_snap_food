import { Schema,Types, model } from "mongoose";

const OrderSchema= new Schema({
    userPhoneNumber:{ type: String, required: true },
    shopId:{
        type: Types.ObjectId,
        ref: "shop", required: true
    },
    addressId: {
        type: Types.ObjectId,
        ref: "user", required: true
    },
    orderProducts:[{
        productId:{type: Types.ObjectId,ref: "product", required: true},
        price:{type: Number,ref: "product", required: true},
        count:{type:Number, required: true},
        discount: { type: Number },
    }],
    prductPriceSum:{type:Number,required: true},
    shippingCost:{type:Number,required: true},
    paymentMethod:{type:String,required: true},
    orderSum:{type:Number,required: true},
    paymentStatus:{type:String,required: true},
    date:{type:String,required: true},
    paymentOnline:{type:Number,required: true},
},{
    timestamps:true
})

export const OrderModel=model("order",OrderSchema)
