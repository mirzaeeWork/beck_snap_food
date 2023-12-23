import { Schema, Types, model, models } from "mongoose";

const MainCategorySchema = new Schema(
    {
        name: { type: String ,required:true},
        imageUrl:{ type: String ,required:true},
    },
    {
        timestamps: true,
    }
);

const MainCategoryModel =model("main-Categories", MainCategorySchema);

export default MainCategoryModel ;

