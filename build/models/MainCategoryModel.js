"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const MainCategorySchema = new mongoose_1.Schema({
    name: { type: String, required: true },
    imageUrl: { type: String, required: true },
}, {
    timestamps: true,
});
const MainCategoryModel = (0, mongoose_1.model)("main-Categories", MainCategorySchema);
exports.default = MainCategoryModel;
