import { phoneNumberValidator } from "@persian-tools/persian-tools";
import { ShopSchema } from "./schema/shopSchema";
import mongoose, { isValidObjectId } from "mongoose";
import MainCategoryModel from "../models/MainCategoryModel";
import SubCategoryModel from "../models/subCategotyModel";

export const checkShop = async (name_Shop: string, name_ShopOwner: string, lastName_ShopOwner: string, phoneNumber: string,
    mainCategoryId: string, subCategoriesIds: string[]) => {
    if (!name_Shop || !name_ShopOwner || !lastName_ShopOwner) return { message: "نام مغازه و نام مالک مغازه و نام خانوادگی مالک مغازه را وارد کنید" }
    await ShopSchema.validate({ name_Shop, name_ShopOwner, lastName_ShopOwner }, { abortEarly: false })
    if (!phoneNumberValidator(phoneNumber)) return { message: "شماره موبایل وارد شده صحیح نمی باشد." };
    if (!isValidObjectId(mainCategoryId)) return { message: "شناسه معتبر نمی باشد" }
    const mainCategory = await MainCategoryModel.findOne({ _id: mainCategoryId })
    if (!mainCategory) return { message: "دسته بندی وجود ندارد" }

    if (subCategoriesIds) {
        if (!Array.isArray(subCategoriesIds) || !subCategoriesIds.every(id => isValidObjectId(id))) {
            return { message: "شناسه ها معتبر نمی باشند" }
        }
        const subcategories = await SubCategoryModel.find({ _id: { $in: subCategoriesIds }, mainCategoryId: mainCategoryId })
        if (subcategories.length !== subCategoriesIds.length) return { message: "همه زیر مجموعه ها بایستی به یک دسته خاص تعلق داشته باشند" }
    }
}



export const LengthSub_SubCategoryIds = async (shop: any, sub_subCategoriesIds: any) => {

        return await SubCategoryModel.aggregate([
            {
                $match: {
                    _id: { $in: shop?.subCategoriesIds },
                },
            },
            {
                $project: {
                    _id: 1,
                    name: 1,
                    sub_subCategory: {
                        $filter: {
                            input: "$sub_subCategory",
                            as: "subSubCat",
                            cond: {
                                $in: [
                                    { $toObjectId: "$$subSubCat._id" },
                                    sub_subCategoriesIds.map((id: any) => new mongoose.Types.ObjectId(id)),
                                ],
                            },
                        },
                    },
                },
            },
            {
                $unwind: "$sub_subCategory",
            },
        ]);
   
}