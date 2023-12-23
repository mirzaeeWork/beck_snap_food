import { Schema, Types, model } from "mongoose";

const ProductsGroupSchema = new Schema({
    title: { type: String,require: true  },
    shopId:{
        type: Types.ObjectId,
        ref: "shop", required: true
    },

    //for foodParty
    startTime:{ type: Number },
    endTime:{ type: Number },
},
    { timestamps: true });

const ProductsGroupModel = model("products-group", ProductsGroupSchema); 
export { ProductsGroupModel };