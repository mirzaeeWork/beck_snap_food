"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const SubCategorySchema = new mongoose_1.Schema({
    name: { type: String, required: true },
    imageUrl: { type: String, required: true },
    mainCategoryId: {
        type: mongoose_1.Types.ObjectId,
        ref: "main-Categories", required: true
    },
    sub_subCategory: [{
            second_name: { type: String, required: true },
            second_imageUrl: { type: String, required: true },
        }]
}, {
    timestamps: true,
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
});
const SubCategoryModel = (0, mongoose_1.model)("sub-categories", SubCategorySchema);
exports.default = SubCategoryModel;
