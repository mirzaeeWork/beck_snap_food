"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductsGroupModel = void 0;
const mongoose_1 = require("mongoose");
const ProductsGroupSchema = new mongoose_1.Schema({
    title: { type: String, require: true },
    shopId: {
        type: mongoose_1.Types.ObjectId,
        ref: "shop", required: true
    },
    startTime: { type: Number },
    endTime: { type: Number },
}, { timestamps: true });
const ProductsGroupModel = (0, mongoose_1.model)("products-group", ProductsGroupSchema);
exports.ProductsGroupModel = ProductsGroupModel;
