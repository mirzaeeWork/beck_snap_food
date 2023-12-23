"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const Sub_SubCategorySchema = new mongoose_1.Schema({
    name: { type: String, required: true },
    imageUrl: { type: String, required: true },
    subCategoryId: {
        type: mongoose_1.Types.ObjectId,
        ref: "sub-categories", required: true
    }
}, {
    timestamps: true,
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
});
const Sub_SubCategoryModel = (0, mongoose_1.model)("sub-sub-categories", Sub_SubCategorySchema);
exports.default = Sub_SubCategoryModel;
