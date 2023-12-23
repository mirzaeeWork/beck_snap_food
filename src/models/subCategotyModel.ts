import { Schema, Types, model, models } from "mongoose";

const SubCategorySchema = new Schema(
    {
        name: { type: String, required: true },
        imageUrl: { type: String, required: true },
        mainCategoryId: {
            type: Types.ObjectId,
            ref: "main-Categories", required: true
        },
        sub_subCategory: [{
            second_name: { type: String, required: true },
            second_imageUrl: { type: String, required: true },
        }]
    },
    {
        timestamps: true,
        createdAt: 'createdAt',
        updatedAt: 'updatedAt',
    }
);

const SubCategoryModel = model("sub-categories", SubCategorySchema);

export default SubCategoryModel;

