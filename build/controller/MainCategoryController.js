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
exports.deleteCategory = exports.updateCategory = exports.getOneCategory = exports.getAllCategory = exports.addMainCategory = void 0;
const MainCategoryModel_1 = __importDefault(require("../models/MainCategoryModel"));
const mongoose_1 = __importStar(require("mongoose"));
const subCategotyModel_1 = __importDefault(require("../models/subCategotyModel"));
const utils_1 = require("../moduls/utils");
const ShopModel_1 = require("../models/ShopModel");
const addMainCategory = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.file)
            throw { message: "تصویر آپلود نشد" };
        const { path } = req.file;
        let url = path.replace(/\\/g, '/');
        url = url.slice(url.indexOf('/uploads'));
        const { name } = req.body;
        if (!name || name.length < 4)
            throw (0, utils_1.handleFileError)("حداقل 4 کاراکتر برای نام وارد کنید", url);
        const mainCategory = yield MainCategoryModel_1.default.findOne({ name });
        if (mainCategory)
            throw (0, utils_1.handleFileError)("دسته بندی تکراری می باشد", url);
        const MainCategory = yield MainCategoryModel_1.default.create({ name, imageUrl: url });
        if (!MainCategory)
            throw (0, utils_1.handleFileError)("دسته بندی ایجاد نشد", url);
        res.status(201).json({
            status: 201, success: true,
            message: "دسته بندی مورد نظر ایجاد شد",
        });
    }
    catch (error) {
        next({ error, status: 400 });
    }
});
exports.addMainCategory = addMainCategory;
const getAllCategory = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { page, per_page } = req.query;
        const pageNumber = page ? +page : 1;
        const itemsPerPage = per_page ? +per_page : 12;
        const MainCategory = yield MainCategoryModel_1.default.aggregate([
            {
                $lookup: {
                    from: subCategotyModel_1.default.collection.name,
                    localField: "_id",
                    foreignField: "mainCategoryId",
                    as: "SubCategories"
                }
            },
            {
                $project: {
                    __v: 0,
                    createdAt: 0,
                    updatedAt: 0,
                    "SubCategories.__v": 0,
                    "SubCategories.createdAt": 0,
                    "SubCategories.updatedAt": 0,
                    "SubCategories.mainCategoryId": 0,
                }
            },
            { $skip: (pageNumber - 1) * itemsPerPage },
            { $limit: itemsPerPage }
        ]);
        if (!MainCategory.length)
            throw { message: "دسته بندی اصلی وجود ندارد" };
        res.status(200).json({
            status: 200, success: true,
            MainCategory
        });
    }
    catch (error) {
        next({ error, status: 400 });
    }
});
exports.getAllCategory = getAllCategory;
const getOneCategory = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const location = ((_a = req === null || req === void 0 ? void 0 : req.cookies) === null || _a === void 0 ? void 0 : _a.location) || req.location;
        if (!location)
            throw { message: "ابتدا یک آدرس انتخاب کنید" };
        const { lat, lng, cityName } = (0, utils_1.verifyToken)(location);
        const centerCoordinates = [+lat, +lng];
        const { _id } = req.body;
        if (!(0, mongoose_1.isValidObjectId)(_id))
            throw { message: "شناسه معتبر نمی باشد" };
        let { page, per_page, sort, filter } = req.query;
        let match;
        let sorted;
        sorted = yield (0, utils_1.sortForShow)(sort, req, next);
        match = yield setMatch(filter, cityName, req, next);
        const pageNumber = (page && +page > 0) ? +page : 1;
        const itemsPerPage = (per_page && +per_page > 0) ? +per_page : 12;
        const MainCategory = yield MainCategoryModel_1.default.aggregate([
            {
                $match: {
                    _id: new mongoose_1.default.Types.ObjectId(_id),
                },
            },
            {
                $lookup: {
                    from: subCategotyModel_1.default.collection.name,
                    localField: "_id",
                    foreignField: "mainCategoryId",
                    as: "SubCategories",
                },
            },
            {
                $lookup: {
                    from: ShopModel_1.ShopModel.collection.name,
                    let: { mainId: "$_id" },
                    pipeline: [
                        {
                            $geoNear: {
                                near: { type: 'Point', coordinates: centerCoordinates },
                                distanceField: 'distance',
                                maxDistance: 10000,
                                spherical: true,
                            },
                        },
                        {
                            $match: match,
                        },
                        sorted
                    ],
                    as: "Shops",
                },
            },
            {
                $addFields: {
                    Shops: {
                        $map: {
                            input: "$Shops",
                            as: "shop",
                            in: {
                                $mergeObjects: [
                                    "$$shop",
                                    {
                                        shippingCost: { $ceil: { $multiply: ["$$shop.distance", 5] } },
                                    },
                                ],
                            },
                        },
                    },
                },
            },
            {
                $addFields: {
                    Shops: {
                        $slice: ["$Shops", (pageNumber - 1) * itemsPerPage, itemsPerPage],
                    },
                },
            },
            {
                $project: {
                    _id: 1, name: 1, imageUrl: 1,
                    SubCategories: {
                        _id: 1, name: 1, imageUrl: 1,
                    },
                    Shops: {
                        _id: 1, name_Shop: 1, imageUrl: 1, brandImgUrl: 1,
                        shopActive: 1, address: 1, distance: 1, shippingCost: 1, ProductPriceAvg: 1
                    },
                },
            },
        ]);
        if (!MainCategory || !MainCategory.length) {
            throw { message: "دسته بندی مورد نظر یافت نشد" };
        }
        res.status(200).json({
            status: 200, success: true, MainCategory
        });
    }
    catch (error) {
        next({ error, status: 400 });
    }
});
exports.getOneCategory = getOneCategory;
const updateCategory = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.file)
            throw { message: "تصویر آپلود نشد" };
        const { path } = req.file;
        let url = path.replace(/\\/g, '/');
        url = url.slice(url.indexOf('/uploads'));
        const { _id, name } = req.body;
        if (!(0, mongoose_1.isValidObjectId)(_id))
            throw (0, utils_1.handleFileError)("شناسه معتبر نمی باشد", url);
        if (!name || name.length < 4)
            throw (0, utils_1.handleFileError)("حداقل 4 کاراکتر برای نام وارد کنید", url);
        const MainCategory = yield MainCategoryModel_1.default.findOne({ name });
        if (MainCategory && MainCategory._id != _id)
            throw (0, utils_1.handleFileError)("دسته بندی تکراری می باشد", url);
        const mainCategory = yield MainCategoryModel_1.default.findOne({ _id }, { imageUrl: 1 });
        if (mainCategory)
            require("fs").unlinkSync(require("path").join(__dirname, "..", "public", mainCategory.imageUrl));
        const result = yield MainCategoryModel_1.default.updateOne({ _id }, { $set: { name, imageUrl: url } });
        if (!result.modifiedCount)
            throw (0, utils_1.handleFileError)("بروزرسانی انجام نشد", url);
        res.status(201).json({
            status: 201, success: true,
            message: " بروزرسانی با موفقیت انجام شد"
        });
    }
    catch (error) {
        next({ error, status: 400 });
    }
});
exports.updateCategory = updateCategory;
const deleteCategory = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { _id } = req.body;
        if (!(0, mongoose_1.isValidObjectId)(_id))
            throw { message: "شناسه معتبر نمی باشد" };
        const subCategory = yield subCategotyModel_1.default.find({ mainCategoryId: _id });
        if (subCategory.length > 0)
            throw { message: "ابتدا زیر مجموعه های این دسته بندی را حذف کنید" };
        const MainCategory = yield MainCategoryModel_1.default.findOneAndDelete({ _id });
        if (!MainCategory)
            throw { message: "دسته بندی مورد نظر پیدا نشد" };
        require("fs").unlinkSync(require("path").join(__dirname, "..", "public", MainCategory.imageUrl));
        res.status(201).json({
            status: 201, success: true,
            message: "دسته بندی مورد نظر حذف شد"
        });
    }
    catch (error) {
        next({ error, status: 400 });
    }
});
exports.deleteCategory = deleteCategory;
const setMatch = (filter, cityName, req, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let match;
        if (!filter) {
            match = {
                $expr: { $eq: ["$mainCategoryId", "$$mainId"] },
                shopActive: true,
                "address.cityName": cityName,
            };
        }
        if (filter == "economy_price") {
            match = {
                $expr: { $eq: ["$mainCategoryId", "$$mainId"] },
                shopActive: true,
                "address.cityName": cityName,
                ProductPriceAvg: { $lte: 300000 }
            };
        }
        if (filter == "average_price") {
            match = {
                $expr: { $eq: ["$mainCategoryId", "$$mainId"] },
                shopActive: true,
                "address.cityName": cityName,
                ProductPriceAvg: { $gt: 300000, $lte: 400000 }
            };
        }
        if (filter == "lux_price") {
            match = {
                $expr: { $eq: ["$mainCategoryId", "$$mainId"] },
                shopActive: true,
                "address.cityName": cityName,
                ProductPriceAvg: { $gt: 400000 }
            };
        }
        return match;
    }
    catch (error) {
        next({ error, status: 400 });
    }
});
