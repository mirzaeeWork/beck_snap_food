"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LengthSub_SubCategoryIds = exports.checkShop = void 0;
const persian_tools_1 = require("@persian-tools/persian-tools");
const shopSchema_1 = require("./schema/shopSchema");
const mongoose_1 = __importStar(require("mongoose"));
const MainCategoryModel_1 = __importDefault(require("../models/MainCategoryModel"));
const subCategotyModel_1 = __importDefault(require("../models/subCategotyModel"));
const checkShop = (name_Shop, name_ShopOwner, lastName_ShopOwner, phoneNumber, mainCategoryId, subCategoriesIds) => __awaiter(void 0, void 0, void 0, function* () {
    if (!name_Shop || !name_ShopOwner || !lastName_ShopOwner)
        return { message: "نام مغازه و نام مالک مغازه و نام خانوادگی مالک مغازه را وارد کنید" };
    yield shopSchema_1.ShopSchema.validate({ name_Shop, name_ShopOwner, lastName_ShopOwner }, { abortEarly: false });
    if (!(0, persian_tools_1.phoneNumberValidator)(phoneNumber))
        return { message: "شماره موبایل وارد شده صحیح نمی باشد." };
    if (!(0, mongoose_1.isValidObjectId)(mainCategoryId))
        return { message: "شناسه معتبر نمی باشد" };
    const mainCategory = yield MainCategoryModel_1.default.findOne({ _id: mainCategoryId });
    if (!mainCategory)
        return { message: "دسته بندی وجود ندارد" };
    if (subCategoriesIds) {
        if (!Array.isArray(subCategoriesIds) || !subCategoriesIds.every(id => (0, mongoose_1.isValidObjectId)(id))) {
            return { message: "شناسه ها معتبر نمی باشند" };
        }
        const subcategories = yield subCategotyModel_1.default.find({ _id: { $in: subCategoriesIds }, mainCategoryId: mainCategoryId });
        if (subcategories.length !== subCategoriesIds.length)
            return { message: "همه زیر مجموعه ها بایستی به یک دسته خاص تعلق داشته باشند" };
    }
});
exports.checkShop = checkShop;
const LengthSub_SubCategoryIds = (shop, sub_subCategoriesIds) => __awaiter(void 0, void 0, void 0, function* () {
    return yield subCategotyModel_1.default.aggregate([
        {
            $match: {
                _id: { $in: shop === null || shop === void 0 ? void 0 : shop.subCategoriesIds },
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
                                sub_subCategoriesIds.map((id) => new mongoose_1.default.Types.ObjectId(id)),
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
});
exports.LengthSub_SubCategoryIds = LengthSub_SubCategoryIds;
