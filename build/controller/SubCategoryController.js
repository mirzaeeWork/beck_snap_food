"use strict";
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
exports.DeleteSub_SubCategory = exports.UpdateSub_SubCategory = exports.CreateSub_SubCategory = exports.deleteSubCategory = exports.updateSubCategory = exports.getOneSubCategory = exports.getOneSubSubCategory = exports.addSubCategory = void 0;
const MainCategoryModel_1 = __importDefault(require("../models/MainCategoryModel"));
const mongoose_1 = require("mongoose");
const subCategotyModel_1 = __importDefault(require("../models/subCategotyModel"));
const mongoose_2 = __importDefault(require("mongoose"));
const utils_1 = require("../moduls/utils");
const ShopModel_1 = require("../models/ShopModel");
const addSubCategory = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.file)
            throw { message: "تصویر آپلود نشد" };
        const { path } = req.file;
        let url = path.replace(/\\/g, '/');
        url = url.slice(url.indexOf('/uploads'));
        const { name, mainCategoryId } = req.body;
        if (!name || name.length < 3)
            throw (0, utils_1.handleFileError)("حداقل 3 کاراکتر برای نام وارد کنید", url);
        if (!(0, mongoose_1.isValidObjectId)(mainCategoryId))
            throw (0, utils_1.handleFileError)("شناسه معتبر نمی باشد", url);
        const result = yield MainCategoryModel_1.default.findOne({ _id: mainCategoryId });
        if (!result)
            throw (0, utils_1.handleFileError)(" دسته بندی مورد نظر وجود ندارد ", url);
        const subCategory = yield subCategotyModel_1.default.findOne({ name, mainCategoryId });
        if (subCategory)
            throw (0, utils_1.handleFileError)("زیر مجموعه برای این دسته بندی تکراری می باشد", url);
        const SubCategory = yield subCategotyModel_1.default.create({ name, imageUrl: url, mainCategoryId });
        if (!SubCategory)
            throw (0, utils_1.handleFileError)("زیر مجموعه ایجاد نشد", url);
        res.status(201).json({
            status: 201, success: true,
            message: "زیر مجموعه مورد نظر ایجاد شد",
        });
    }
    catch (error) {
        next({ error, status: 400 });
    }
});
exports.addSubCategory = addSubCategory;
const getOneSubSubCategory = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
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
        const { page, per_page, sort, filter } = req.query;
        let match;
        let sorted;
        sorted = yield (0, utils_1.sortForShow)(sort, req, next);
        match = yield setMatch_Sub_SubCategory(filter, cityName, _id, req, next);
        const pageNumber = (page && +page > 0) ? +page : 1;
        const itemsPerPage = (per_page && +per_page > 0) ? +per_page : 12;
        const SubCategory = yield subCategotyModel_1.default.aggregate([
            {
                $match: {
                    "sub_subCategory._id": new mongoose_2.default.Types.ObjectId(_id)
                },
            },
            {
                $lookup: {
                    from: MainCategoryModel_1.default.collection.name,
                    localField: "mainCategoryId",
                    foreignField: "_id",
                    as: "mainCategory",
                },
            },
            {
                $lookup: {
                    from: ShopModel_1.ShopModel.collection.name,
                    let: { subId: "$_id" },
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
                        $slice: ["$Shops", (pageNumber - 1) * itemsPerPage, itemsPerPage]
                    }
                },
            },
            {
                $project: {
                    _id: 1,
                    name: 1,
                    imageUrl: 1,
                    sub_subCategory: 1,
                    mainCategory: {
                        _id: 1,
                        name: 1,
                    },
                    Shops: {
                        _id: 1,
                        name_Shop: 1,
                        imageUrl: 1,
                        brandImgUrl: 1,
                        shopActive: 1,
                        address: 1,
                        subCategoriesIds: 1,
                        sub_subCategoriesIds: 1, distance: 1, shippingCost: 1, ProductPriceAvg: 1
                    },
                },
            }
        ]);
        res.status(200).json({
            status: 200, success: true,
            SubCategory,
        });
    }
    catch (error) {
        next({ error, status: 400 });
    }
});
exports.getOneSubSubCategory = getOneSubSubCategory;
const getOneSubCategory = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _b;
    try {
        const location = ((_b = req === null || req === void 0 ? void 0 : req.cookies) === null || _b === void 0 ? void 0 : _b.location) || req.location;
        if (!location)
            throw { message: "ابتدا یک آدرس انتخاب کنید" };
        const { lat, lng, cityName } = (0, utils_1.verifyToken)(location);
        const centerCoordinates = [+lat, +lng];
        const { _id } = req.body;
        if (!(0, mongoose_1.isValidObjectId)(_id))
            throw { message: "شناسه معتبر نمی باشد" };
        const { page, per_page, sort, filter } = req.query;
        let match;
        let sorted;
        sorted = yield (0, utils_1.sortForShow)(sort, req, next);
        match = yield setMatch(filter, cityName, req, next);
        const pageNumber = (page && +page > 0) ? +page : 1;
        const itemsPerPage = (per_page && +per_page > 0) ? +per_page : 12;
        const SubCategory = yield subCategotyModel_1.default.aggregate([
            {
                $match: {
                    _id: new mongoose_2.default.Types.ObjectId(_id),
                },
            },
            {
                $lookup: {
                    from: MainCategoryModel_1.default.collection.name,
                    localField: "mainCategoryId",
                    foreignField: "_id",
                    as: "mainCategory",
                },
            },
            {
                $lookup: {
                    from: ShopModel_1.ShopModel.collection.name,
                    let: { subId: "$_id" },
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
                        $slice: ["$Shops", (pageNumber - 1) * itemsPerPage, itemsPerPage]
                    }
                },
            },
            {
                $project: {
                    _id: 1,
                    name: 1,
                    imageUrl: 1,
                    sub_subCategory: 1,
                    mainCategory: {
                        _id: 1,
                        name: 1,
                    },
                    Shops: {
                        _id: 1,
                        name_Shop: 1,
                        imageUrl: 1,
                        brandImgUrl: 1,
                        shopActive: 1,
                        address: 1,
                        subCategoriesIds: 1,
                        sub_subCategoriesIds: 1, distance: 1, shippingCost: 1, ProductPriceAvg: 1
                    },
                },
            }
        ]);
        if (!SubCategory.length)
            throw { message: "دسته بندی مورد نظر یافت نشد" };
        res.status(200).json({
            status: 200, success: true,
            SubCategory
        });
    }
    catch (error) {
        next({ error, status: 400 });
    }
});
exports.getOneSubCategory = getOneSubCategory;
const updateSubCategory = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.file)
            throw { message: "تصویر آپلود نشد" };
        const { path } = req.file;
        let url = path.replace(/\\/g, '/');
        url = url.slice(url.indexOf('/uploads'));
        const { _id, name, mainCategoryId } = req.body;
        if (!(0, mongoose_1.isValidObjectId)(_id))
            throw (0, utils_1.handleFileError)("شناسه معتبر نمی باشد", url);
        if (!(0, mongoose_1.isValidObjectId)(mainCategoryId))
            throw (0, utils_1.handleFileError)("شناسه معتبر نمی باشد", url);
        if (!name || name.length < 3)
            throw (0, utils_1.handleFileError)("حداقل 3 کاراکتر برای نام وارد کنید", url);
        const response = yield MainCategoryModel_1.default.findOne({ _id: mainCategoryId });
        if (!response)
            throw (0, utils_1.handleFileError)(" دسته بندی مورد نظر وجود ندارد ", url);
        const subCategory = yield subCategotyModel_1.default.findOne({ name, mainCategoryId });
        if (subCategory && subCategory._id != _id)
            throw (0, utils_1.handleFileError)("زیر مجموعه برای این دسته بندی تکراری می باشد", url);
        const SubCategory = yield subCategotyModel_1.default.findOne({ _id }, { imageUrl: 1 });
        const result = yield subCategotyModel_1.default.updateOne({ _id }, { $set: { name, imageUrl: url, mainCategoryId } });
        if (!result.modifiedCount)
            throw (0, utils_1.handleFileError)("بروزرسانی انجام نشد", url);
        if (SubCategory)
            require("fs").unlinkSync(require("path").join(__dirname, "..", "public", SubCategory.imageUrl));
        res.status(201).json({
            status: 201, success: true,
            message: " بروزرسانی با موفقیت انجام شد"
        });
    }
    catch (error) {
        next({ error, status: 400 });
    }
});
exports.updateSubCategory = updateSubCategory;
const deleteSubCategory = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { _id } = req.body;
        if (!(0, mongoose_1.isValidObjectId)(_id))
            throw { message: "شناسه معتبر نمی باشد" };
        const subCategory = yield subCategotyModel_1.default.findOne({ _id });
        if (subCategory && subCategory.sub_subCategory.length > 0)
            throw { message: "ابتدا بایستی مجموعه های ثانویه این زیر مجموعه حذف شوند" };
        if (yield ShopModel_1.ShopModel.findOne({ subCategoriesIds: _id })) {
            const shops = yield ShopModel_1.ShopModel.updateMany({ subCategoriesIds: _id }, { $pull: { subCategoriesIds: _id }, $set: { shopActive: false } });
            if (!shops.modifiedCount)
                throw { message: "فروشگاه های این زیر مجموعه غیرفعال نشد" };
        }
        const SubCategory = yield subCategotyModel_1.default.findOneAndDelete({ _id });
        if (!SubCategory)
            throw { message: "زیر مجموعه مورد نظر یافت نشد" };
        require("fs").unlinkSync(require("path").join(__dirname, "..", "public", SubCategory.imageUrl));
        res.status(201).json({
            status: 201, success: true,
            message: "زیر مجموعه مورد نظر حذف شد"
        });
    }
    catch (error) {
        next({ error, status: 400 });
    }
});
exports.deleteSubCategory = deleteSubCategory;
const CreateSub_SubCategory = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.file)
            throw { message: "تصویر آپلود نشد" };
        const { path } = req.file;
        let url = path.replace(/\\/g, '/');
        url = url.slice(url.indexOf('/uploads'));
        const { subCategoryId, second_name } = req.body;
        if (!second_name || second_name.length < 3)
            throw (0, utils_1.handleFileError)("حداقل 3 کاراکتر برای نام وارد کنید", url);
        if (!(0, mongoose_1.isValidObjectId)(subCategoryId))
            throw (0, utils_1.handleFileError)("زیر مجموعه مورد نظر یافت نشد", url);
        const subCategory = yield subCategotyModel_1.default.findOne({ _id: subCategoryId, 'sub_subCategory.second_name': second_name });
        if (subCategory)
            throw (0, utils_1.handleFileError)(" مجموعه ثانویه در این زیر مجموعه وجود دارد", url);
        const update = {
            $push: {
                sub_subCategory: {
                    second_name,
                    second_imageUrl: url,
                },
            },
        };
        const SubCategory = yield subCategotyModel_1.default.findOneAndUpdate({ _id: subCategoryId }, update);
        if (!SubCategory)
            throw (0, utils_1.handleFileError)(" مجموعه ثانویه ایجاد نشد", url);
        res.status(201).json({
            status: 201, success: true,
            message: " مجموعه ثانویه مورد نظر ایجاد شد",
        });
    }
    catch (error) {
        next({ error, status: 400 });
    }
});
exports.CreateSub_SubCategory = CreateSub_SubCategory;
const UpdateSub_SubCategory = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.file)
            throw { message: "تصویر آپلود نشد" };
        const { path } = req.file;
        let url = path.replace(/\\/g, '/');
        url = url.slice(url.indexOf('/uploads'));
        const { subCategoryId, sub_subCategoryID, second_name } = req.body;
        if (!second_name || second_name.length < 3)
            throw (0, utils_1.handleFileError)("حداقل 3 کاراکتر برای نام وارد کنید", url);
        if (!(0, mongoose_1.isValidObjectId)(subCategoryId))
            throw (0, utils_1.handleFileError)("زیر مجموعه مورد نظر یافت نشد", url);
        if (!(0, mongoose_1.isValidObjectId)(sub_subCategoryID))
            throw (0, utils_1.handleFileError)(" مجموعه ثانویه مورد نظر یافت نشد", url);
        const Sub_SubCategory = yield subCategotyModel_1.default.findOne({ _id: subCategoryId }, { 'sub_subCategory': { $elemMatch: { second_name } } });
        if ((Sub_SubCategory === null || Sub_SubCategory === void 0 ? void 0 : Sub_SubCategory.sub_subCategory[0]) && Sub_SubCategory.sub_subCategory[0]._id != sub_subCategoryID
            && Sub_SubCategory.sub_subCategory[0].second_name == second_name) {
            throw (0, utils_1.handleFileError)("نام مجموعه ثانویه برای این زیر مجموعه تکراری می باشد", url);
        }
        const subCategory = yield subCategotyModel_1.default.findOne({ _id: subCategoryId }, { 'sub_subCategory': { $elemMatch: { _id: sub_subCategoryID } } });
        const SubCategory = yield subCategotyModel_1.default.updateOne({ _id: subCategoryId, 'sub_subCategory._id': sub_subCategoryID }, {
            $set: {
                'sub_subCategory.$.second_name': second_name,
                'sub_subCategory.$.second_imageUrl': url
            }
        });
        if (!SubCategory)
            throw (0, utils_1.handleFileError)(" مجموعه ثانویه بروزرسانی نشد", url);
        if (subCategory === null || subCategory === void 0 ? void 0 : subCategory.sub_subCategory[0])
            require("fs").unlinkSync(require("path").join(__dirname, "..", "public", subCategory.sub_subCategory[0].second_imageUrl));
        res.status(201).json({
            status: 201, success: true,
            message: " مجموعه ثانویه مورد نظر بروزرسانی شد"
        });
    }
    catch (error) {
        next({ error, status: 400 });
    }
});
exports.UpdateSub_SubCategory = UpdateSub_SubCategory;
const DeleteSub_SubCategory = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { subCategoryId, sub_subCategoryID } = req.body;
        if (!(0, mongoose_1.isValidObjectId)(subCategoryId))
            throw { message: "شناسه معتبر نمی باشد" };
        if (!(0, mongoose_1.isValidObjectId)(sub_subCategoryID))
            throw { message: "شناسه معتبر نمی باشد" };
        if (yield ShopModel_1.ShopModel.findOne({ sub_subCategoriesIds: sub_subCategoryID })) {
            const shops = yield ShopModel_1.ShopModel.updateMany({ sub_subCategoriesIds: sub_subCategoryID }, { $pull: { sub_subCategoriesIds: sub_subCategoryID }, $set: { shopActive: false } });
            if (!shops.modifiedCount)
                throw { message: "فروشگاه های مجموعه ثانویه غیرفعال نشد" };
        }
        const subCategory = yield subCategotyModel_1.default.findOne({ _id: subCategoryId }, { 'sub_subCategory': { $elemMatch: { _id: sub_subCategoryID } } });
        const SubCategory = yield subCategotyModel_1.default.updateOne({ _id: subCategoryId }, { $pull: { sub_subCategory: { _id: sub_subCategoryID } } });
        if (!SubCategory.modifiedCount)
            throw { message: " مجموعه ثانویه حذف نشد" };
        if (subCategory === null || subCategory === void 0 ? void 0 : subCategory.sub_subCategory[0])
            require("fs").unlinkSync(require("path").join(__dirname, "..", "public", subCategory.sub_subCategory[0].second_imageUrl));
        res.status(201).json({
            status: 201, success: true,
            message: " مجموعه ثانویه مورد نظر حذف شد"
        });
    }
    catch (error) {
        next({ error, status: 400 });
    }
});
exports.DeleteSub_SubCategory = DeleteSub_SubCategory;
const setMatch = (filter, cityName, req, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let match;
        if (!filter) {
            match = {
                $expr: { $in: ["$$subId", "$subCategoriesIds"] },
                shopActive: true,
                "address.cityName": cityName,
            };
        }
        if (filter == "economy_price") {
            match = {
                $expr: { $in: ["$$subId", "$subCategoriesIds"] },
                shopActive: true,
                "address.cityName": cityName,
                ProductPriceAvg: { $lte: 300000 }
            };
        }
        if (filter == "average_price") {
            match = {
                $expr: { $in: ["$$subId", "$subCategoriesIds"] },
                shopActive: true,
                "address.cityName": cityName,
                ProductPriceAvg: { $gt: 300000, $lte: 400000 }
            };
        }
        if (filter == "lux_price") {
            match = {
                $expr: { $in: ["$$subId", "$subCategoriesIds"] },
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
const setMatch_Sub_SubCategory = (filter, cityName, _id, req, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let match;
        if (!filter) {
            match = {
                $expr: { $in: ["$$subId", "$subCategoriesIds"] },
                shopActive: true, "address.cityName": cityName,
                sub_subCategoriesIds: new mongoose_2.default.Types.ObjectId(_id)
            };
        }
        if (filter == "economy_price") {
            match = {
                $expr: { $in: ["$$subId", "$subCategoriesIds"] },
                shopActive: true, "address.cityName": cityName,
                sub_subCategoriesIds: new mongoose_2.default.Types.ObjectId(_id),
                ProductPriceAvg: { $lte: 300000 }
            };
        }
        if (filter == "average_price") {
            match = {
                $expr: { $in: ["$$subId", "$subCategoriesIds"] },
                shopActive: true, "address.cityName": cityName,
                sub_subCategoriesIds: new mongoose_2.default.Types.ObjectId(_id),
                ProductPriceAvg: { $gt: 300000, $lte: 400000 }
            };
        }
        if (filter == "lux_price") {
            match = {
                $expr: { $in: ["$$subId", "$subCategoriesIds"] },
                shopActive: true, "address.cityName": cityName,
                sub_subCategoriesIds: new mongoose_2.default.Types.ObjectId(_id),
                ProductPriceAvg: { $gt: 400000 }
            };
        }
        return match;
    }
    catch (error) {
        next({ error, status: 400 });
    }
});
