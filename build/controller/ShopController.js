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
exports.logoutShop = exports.getNameSearch = exports.deleteShop = exports.setOpen = exports.setActive = exports.getShopProduct = exports.getAllShopFalse = exports.getShopProductTrue = exports.update_second = exports.update_first = exports.login_shop = exports.sendOTP_shop = exports.req_otp_shop = void 0;
const setAddress_1 = require("../moduls/setAddress");
const persian_tools_1 = require("@persian-tools/persian-tools");
const utils_1 = require("../moduls/utils");
const shopCheck_1 = require("../validation/shopCheck");
const ShopModel_1 = require("../models/ShopModel");
const mongoose_1 = __importStar(require("mongoose"));
const MainCategoryModel_1 = __importDefault(require("../models/MainCategoryModel"));
const subCategotyModel_1 = __importDefault(require("../models/subCategotyModel"));
const ProductsGroupModel_1 = require("../models/ProductsGroupModel");
const productModel_1 = require("../models/productModel");
const cityModel_1 = __importDefault(require("../models/cityModel"));
const req_otp_shop = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name_Shop, name_ShopOwner, lastName_ShopOwner, phoneNumber, cityName, addressChoose, addressDetails, mainCategoryId, subCategoriesIds, introduceCode } = req.body;
        const errors = yield (0, shopCheck_1.checkShop)(name_Shop, name_ShopOwner, lastName_ShopOwner, phoneNumber, mainCategoryId, subCategoriesIds);
        if (errors)
            throw errors;
        const phoneNumbers = (0, persian_tools_1.phoneNumberNormalizer)(phoneNumber, "0");
        const repeat = yield ShopModel_1.ShopModel.findOne({ name_Shop });
        if (repeat)
            throw { message: "نام مغازه تکراری است" };
        const error = yield (0, setAddress_1.setAddressForUser)(cityName, addressChoose, addressDetails);
        if (error)
            throw error;
        const result = yield (0, setAddress_1.getLatLng)(cityName, addressChoose);
        if (!result)
            throw { message: "طول و عرض جغرافیایی نامعتبر است" };
        const { lat, lng } = result;
        const geoLocation = { type: "Point", coordinates: [lat, lng] };
        const OTP = (0, utils_1.otp_Generator)();
        const options = {
            new: true,
            upsert: true,
        };
        const shop = yield ShopModel_1.ShopModel.findOneAndUpdate({ phoneNumber: phoneNumbers, name_Shop }, {
            name_Shop, name_ShopOwner, lastName_ShopOwner, phoneNumber: phoneNumbers,
            address: { cityName, addressChoose, addressDetails, geoLocation },
            OTP: { value: OTP, expireIn: Date.now() + 120000 },
            mainCategoryId, subCategoriesIds, introduceCode, shopActive: false
        }, options);
        if (!shop)
            throw { message: "رمز یکبار مصرف ارسال نشد." };
        const req_OTP = (0, utils_1.createToken)({ name_Shop, phoneNumber: phoneNumbers }, "3m");
        res.cookie("req_OTP_shop", req_OTP, {
            httpOnly: true,
            sameSite: "strict",
            secure: true,
        });
        res.status(201).json({ success: true, message: "رمز یکبار مصرف به شماره موبایل ارسال شد.", shop });
    }
    catch (error) {
        next({ error, status: 400 });
    }
});
exports.req_otp_shop = req_otp_shop;
const sendOTP_shop = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const req_OTP_shop = (_a = req === null || req === void 0 ? void 0 : req.cookies) === null || _a === void 0 ? void 0 : _a.req_OTP_shop;
        if (!req_OTP_shop)
            throw { message: "شماره موبایل را وارد کنید" };
        const { name_Shop, phoneNumber } = (0, utils_1.verifyToken)(req_OTP_shop);
        if (!phoneNumber) {
            res.clearCookie("req_OTP_shop");
            throw { message: "شماره موبایل را وارد کنید" };
        }
        const shop = yield ShopModel_1.ShopModel.findOne({ name_Shop, phoneNumber });
        if (!shop)
            throw { message: "فروشگاه یافت نشد." };
        let { OTP } = req.body;
        if (shop.OTP && shop.OTP.expireIn) {
            if (OTP != shop.OTP.value)
                throw { message: "رمز یکبار مصرف ارسال شده صحیح نمیباشد." };
            if (Date.now() > shop.OTP.expireIn)
                throw { message: "رمز یکبار مصرف منقضی شده است." };
        }
        const shopToken = (0, utils_1.createToken)({ name_Shop, phoneNumber }, "1y");
        res.cookie("shop", shopToken, {
            httpOnly: true,
            sameSite: "strict",
            secure: true,
        });
        res.clearCookie("req_OTP_shop");
        res.status(201).json({
            success: true,
            message: "وارد پنل فروشگاهی شدید"
        });
    }
    catch (error) {
        next({ error, status: 400 });
    }
});
exports.sendOTP_shop = sendOTP_shop;
const login_shop = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let { name_Shop, phoneNumber } = req.body;
        if (!(0, persian_tools_1.phoneNumberValidator)(phoneNumber))
            throw { message: "شماره موبایل وارد شده صحیح نمی باشد." };
        const phoneNumbers = (0, persian_tools_1.phoneNumberNormalizer)(phoneNumber, "0");
        if (!name_Shop || name_Shop.length < 3)
            throw { message: "حداقل 3 کاراکتر برای نام مغازه وارد کنید" };
        const shop = yield ShopModel_1.ShopModel.findOne({ name_Shop, phoneNumber: phoneNumbers });
        if (!shop)
            throw { message: "فروشگاه یافت نشد." };
        const OTP = (0, utils_1.otp_Generator)();
        shop.OTP = { value: OTP, expireIn: Date.now() + 120000 };
        shop.save();
        const req_OTP = (0, utils_1.createToken)({ name_Shop, phoneNumber: phoneNumbers }, "3m");
        res.cookie("req_OTP_shop", req_OTP, {
            httpOnly: true,
            sameSite: "strict",
            secure: true,
        });
        res.status(201).json({ success: true, message: "رمز یکبار مصرف به شماره موبایل ارسال شد.", shop });
    }
    catch (error) {
        next({ error, status: 400 });
    }
});
exports.login_shop = login_shop;
const update_first = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { _id, name_Shop, name_ShopOwner, lastName_ShopOwner, phoneNumber, cityName, addressChoose, addressDetails, mainCategoryId, subCategoriesIds, introduceCode } = req.body;
        if (!(0, mongoose_1.isValidObjectId)(_id))
            throw { message: "شناسه معتبر نمی باشد" };
        const errors = yield (0, shopCheck_1.checkShop)(name_Shop, name_ShopOwner, lastName_ShopOwner, phoneNumber, mainCategoryId, subCategoriesIds);
        if (errors)
            throw errors;
        const phoneNumbers = (0, persian_tools_1.phoneNumberNormalizer)(phoneNumber, "0");
        const repeat = yield ShopModel_1.ShopModel.findOne({ name_Shop });
        if (repeat && repeat._id != _id)
            throw { message: "نام مغازه تکراری است" };
        const error = yield (0, setAddress_1.setAddressForUser)(cityName, addressChoose, addressDetails);
        if (error)
            throw error;
        const result = yield (0, setAddress_1.getLatLng)(cityName, addressChoose);
        if (!result)
            throw { message: "طول و عرض جغرافیایی نامعتبر است" };
        const { lat, lng } = result;
        const geoLocation = { type: "Point", coordinates: [lat, lng] };
        const reponse = yield ShopModel_1.ShopModel.updateOne({ _id }, {
            name_Shop, name_ShopOwner, lastName_ShopOwner, phoneNumber: phoneNumbers,
            address: { cityName, addressChoose, addressDetails, geoLocation },
            mainCategoryId, subCategoriesIds, introduceCode, shopActive: false
        });
        if (!reponse.modifiedCount)
            throw { message: "بروزرسانی اولیه انجام نشد" };
        const shopToken = (0, utils_1.createToken)({ name_Shop, phoneNumber }, "1y");
        res.cookie("shop", shopToken, {
            httpOnly: true,
            sameSite: "strict",
            secure: true,
        });
        res.status(201).json({ success: true, message: "بروزرسانی اولیه انجام شد" });
    }
    catch (error) {
        next({ error, status: 400 });
    }
});
exports.update_first = update_first;
const update_second = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _b, _c;
    try {
        const length = (_b = req.files) === null || _b === void 0 ? void 0 : _b.length;
        if (!req.files)
            throw { message: "تصاویر آپلود نشد" };
        const images_shop = (_c = req.files) === null || _c === void 0 ? void 0 : _c.map((file) => {
            let url = file.path.replace(/\\/g, '/');
            url = url.slice(url.indexOf('/uploads'));
            return (url);
        });
        if (length < 2)
            throw (0, utils_1.handleFilesErrorShop)("بایستی دو تصویر آپلود شود", images_shop || []);
        const shop = yield ShopModel_1.ShopModel.findOne({ phoneNumber: req.phoneNumber_shop, name_Shop: req.name_Shop });
        const { description, sub_subCategoriesIds, salesTax } = req.body;
        if (!description || description.length < 5)
            throw (0, utils_1.handleFilesErrorShop)("حداقل 5 کاراکتر برای توضیحات وارد شود", images_shop || []);
        if (salesTax && (+salesTax < 1 || +salesTax > 20))
            throw (0, utils_1.handleFilesErrorShop)(" حداکثر مالیات 20% می باشد", images_shop || []);
        if (sub_subCategoriesIds) {
            sub_subCategoriesIds === null || sub_subCategoriesIds === void 0 ? void 0 : sub_subCategoriesIds.map((id) => {
                if (!(0, mongoose_1.isValidObjectId)(id))
                    throw (0, utils_1.handleFilesErrorShop)("شناسه ها معتبر نمی باشند", images_shop || []);
            });
            const subcategories = yield (0, shopCheck_1.LengthSub_SubCategoryIds)(shop, sub_subCategoriesIds);
            if (subcategories.length !== sub_subCategoriesIds.length) {
                throw (0, utils_1.handleFilesErrorShop)("تمام زیر مجموعه های ثانویه بایستی به زیر مجموعه های انتخابی تعلق داشته باشند", images_shop || []);
            }
        }
        const result = yield ShopModel_1.ShopModel.updateOne({ phoneNumber: req.phoneNumber_shop, name_Shop: req.name_Shop }, {
            imageUrl: images_shop[0], salesTax: +salesTax,
            brandImgUrl: images_shop[1], description, sub_subCategoriesIds, shopActive: false
        });
        if (!result.modifiedCount)
            throw { message: "بروزرسانی ثانویه انجام نشد" };
        res.status(201).json({
            success: true, message: "بروزرسانی ثانویه انجام شد", images_shop, sub_subCategoriesIds
        });
    }
    catch (error) {
        next({ error, status: 400 });
    }
});
exports.update_second = update_second;
const getShopProductTrue = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _d;
    try {
        const location = ((_d = req === null || req === void 0 ? void 0 : req.cookies) === null || _d === void 0 ? void 0 : _d.location) || req.location;
        if (!location)
            throw { message: "ابتدا یک آدرس انتخاب کنید" };
        const { lat, lng, cityName } = (0, utils_1.verifyToken)(location);
        const centerCoordinates = [+lat, +lng];
        const { _id } = req.body;
        if (!(0, mongoose_1.isValidObjectId)(_id))
            throw { message: "شناسه معتبر نمی باشد" };
        const shop = yield ShopModel_1.ShopModel.aggregate([
            {
                $geoNear: {
                    near: { type: 'Point', coordinates: centerCoordinates },
                    distanceField: 'distance',
                    spherical: true,
                },
            },
            {
                $match: { _id: new mongoose_1.default.Types.ObjectId(_id), shopActive: true },
            },
            {
                $addFields: {
                    shippingCost: {
                        $ceil: { $multiply: ['$distance', 5] },
                    },
                },
            },
            {
                $project: {
                    _id: 1,
                    name_Shop: 1,
                    brandImgUrl: 1,
                    imageUrl: 1,
                    shopActive: 1,
                    address: 1,
                    distance: 1,
                    shippingCost: 1,
                },
            },
        ]);
        const productGroup = yield ProductsGroupModel_1.ProductsGroupModel.aggregate([
            {
                $match: { shopId: new mongoose_1.default.Types.ObjectId(_id) },
            },
            {
                $lookup: {
                    from: productModel_1.ProductModel.collection.name,
                    let: { productsGroupId: "$_id" },
                    pipeline: [
                        { $match: { $expr: { $eq: ["$productsGroupId", "$$productsGroupId"] } } },
                        { $match: { isActive: true } }
                    ],
                    as: "products",
                },
            },
            {
                $project: {
                    createdAt: 0,
                    updatedA: 0,
                    __v: 0,
                    products: {
                        createdAt: 0, updatedA: 0, __v: 0,
                    }
                }
            }
        ]);
        if (!shop.length)
            throw { message: "فروشگاه یافت نشد." };
        let resultAddress = "";
        if (shop[0].distance > 5000) {
            resultAddress = "آدرس مورد نظر در محدوده سرویس دهی فروشگاه نمی باشد",
                shop[0].shippingCost = 0;
        }
        res.status(200).json({
            status: 200, success: true, resultAddress,
            shop,
            productGroup
        });
    }
    catch (error) {
        next({ error, status: 400 });
    }
});
exports.getShopProductTrue = getShopProductTrue;
const getAllShopFalse = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { cityName } = req.body;
        if (!cityName)
            throw { message: "لطفا نام شهر را وارد کنید" };
        const city = yield cityModel_1.default.findOne({ title: cityName });
        if (!city)
            return { message: "نام شهر مجاز نمی باشد" };
        const shop = yield ShopModel_1.ShopModel.find({ "address.cityName": cityName, shopActive: false });
        res.status(200).json({
            status: 200, success: true,
            shop,
        });
    }
    catch (error) {
        next({ error, status: 400 });
    }
});
exports.getAllShopFalse = getAllShopFalse;
const getShopProduct = (count) => (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let match;
        if (count == 1) {
            match = { _id: new mongoose_1.default.Types.ObjectId(req.shopId) };
        }
        else if (count == 2) {
            let { name_Shop, phoneNumber } = req.body;
            if (!(0, persian_tools_1.phoneNumberValidator)(phoneNumber))
                throw { message: "شماره موبایل وارد شده صحیح نمی باشد." };
            const phoneNumbers = (0, persian_tools_1.phoneNumberNormalizer)(phoneNumber, "0");
            if (!name_Shop || name_Shop.length < 3)
                throw { message: "حداقل 3 کاراکتر برای نام مغازه وارد کنید" };
            match = {
                name_Shop, phoneNumber: phoneNumbers
            };
        }
        else if (count == 3) {
            const { _id } = req.body;
            if (!(0, mongoose_1.isValidObjectId)(_id))
                throw { message: "شناسه معتبر نمی باشد" };
            match = { _id: new mongoose_1.default.Types.ObjectId(_id) };
        }
        const shop = yield ShopModel_1.ShopModel.aggregate([
            {
                $match: match,
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
                    from: subCategotyModel_1.default.collection.name,
                    localField: "subCategoriesIds",
                    foreignField: "_id",
                    as: "SubCategories",
                },
            },
            {
                $addFields: {
                    SubCategories: {
                        $map: {
                            input: "$SubCategories",
                            as: "subcategory",
                            in: {
                                _id: "$$subcategory._id",
                                name: "$$subcategory.name",
                                sub_subCategory: {
                                    $filter: {
                                        input: "$$subcategory.sub_subCategory",
                                        as: "item",
                                        cond: {
                                            $in: ["$$item._id", "$sub_subCategoriesIds"]
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            },
            {
                $project: {
                    name_Shop: 1, name_ShopOwner: 1, lastName_ShopOwner: 1, phoneNumber: 1,
                    imageUrl: 1, brandImgUrl: 1, description: 1, shopActive: 1, shopOpen: 1,
                    address: 1,
                    mainCategory: { name: 1 },
                    SubCategories: { _id: 1, name: 1, sub_subCategory: { _id: 1, second_name: 1 } },
                }
            }
        ]);
        const productGroup = yield ProductsGroupModel_1.ProductsGroupModel.aggregate([
            {
                $match: { shopId: new mongoose_1.default.Types.ObjectId(shop[0]._id) },
            },
            {
                $lookup: {
                    from: productModel_1.ProductModel.collection.name,
                    localField: "_id",
                    foreignField: "productsGroupId",
                    as: "products",
                },
            },
            {
                $project: {
                    createdAt: 0,
                    updatedA: 0,
                    __v: 0,
                    products: {
                        createdAt: 0, updatedA: 0, __v: 0,
                    }
                }
            }
        ]);
        if (!shop.length)
            throw { message: "فروشگاه یافت نشد." };
        res.status(200).json({
            status: 200, success: true,
            shop, productGroup
        });
    }
    catch (error) {
        next({ error, status: 400 });
    }
});
exports.getShopProduct = getShopProduct;
const setActive = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name_Shop, phoneNumber, shopActive } = req.body;
        if (!(0, persian_tools_1.phoneNumberValidator)(phoneNumber))
            throw { message: "شماره موبایل وارد شده صحیح نمی باشد." };
        const phoneNumbers = (0, persian_tools_1.phoneNumberNormalizer)(phoneNumber, "0");
        if (!name_Shop || name_Shop.length < 3)
            throw { message: "حداقل 3 کاراکتر برای نام مغازه وارد کنید" };
        if (typeof (shopActive) != 'boolean')
            throw { message: "مقدار بایستی از نوع بولین باشد" };
        const result = yield ShopModel_1.ShopModel.updateOne({ name_Shop, phoneNumber: phoneNumbers }, { shopActive });
        if (!result.modifiedCount)
            throw { message: "بروزرسانی فعالیت انجام نشد" };
        res.status(201).json({
            status: 201, success: true, message: "بروزرسانی فعالیت با موفقیت انجام شد"
        });
    }
    catch (error) {
        next({ error, status: 400 });
    }
});
exports.setActive = setActive;
const setOpen = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { shopOpen } = req.body;
        if (!(typeof shopOpen == 'boolean'))
            throw { message: "مقدار بایستی از نوع بولین باشد" };
        const result = yield ShopModel_1.ShopModel.updateOne({ _id: req.shopId }, { shopOpen });
        if (!result.modifiedCount)
            throw { message: "بروزرسانی باز یا بسته بودن فروشگاه انجام نشد" };
        res.status(201).json({
            status: 201, success: true, message: "بروزرسانی باز یا بسته بودن فروشگاه با موفقیت انجام شد"
        });
    }
    catch (error) {
        next({ error, status: 400 });
    }
});
exports.setOpen = setOpen;
const deleteShop = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { _id } = req.body;
        if (!(0, mongoose_1.isValidObjectId)(_id))
            throw { message: "شناسه معتبر نمی باشد" };
        if (yield productModel_1.ProductModel.findOne({ shopId: _id })) {
            const products = yield productModel_1.ProductModel.deleteMany({ shopId: _id });
            if (!products.deletedCount)
                throw { message: "محصولات این فروشگاه را حذف نشد" };
        }
        if (yield ProductsGroupModel_1.ProductsGroupModel.findOne({ shopId: _id })) {
            const productGroup = yield ProductsGroupModel_1.ProductsGroupModel.deleteMany({ shopId: _id });
            if (!productGroup.deletedCount)
                throw { message: " گروه محصولات این فروشگاه حذف نشد" };
        }
        const result = yield ShopModel_1.ShopModel.deleteOne({ _id });
        if (!result.deletedCount)
            throw { message: "فروشگاه حذف نشد" };
        res.status(201).json({
            status: 201, success: true, message: "فروشگاه با موفقیت حذف شد"
        });
    }
    catch (error) {
        next({ error, status: 400 });
    }
});
exports.deleteShop = deleteShop;
const getNameSearch = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _e;
    try {
        const location = (_e = req === null || req === void 0 ? void 0 : req.cookies) === null || _e === void 0 ? void 0 : _e.location;
        let lat, lng, cityName;
        if (location) {
            ({ lat, lng, cityName } = (0, utils_1.verifyToken)(location));
        }
        const { search } = req.body;
        if (search.length < 3) {
            res.status(200).json({
                status: 200, success: true
            });
        }
        const mainCategory = yield MainCategoryModel_1.default.find({ name: { $regex: search } }, { _id: 1, name: 1 });
        const SubCategory = yield subCategotyModel_1.default.find({ name: { $regex: search } }, { _id: 1, name: 1 });
        const sub_SubCategory = yield subCategotyModel_1.default.find({ "sub_subCategory.second_name": { $regex: search } }, { "sub_subCategory.$": 1 });
        const shops = yield ShopModel_1.ShopModel.find({ name_Shop: { $regex: search }, shopActive: true, "address.cityName": cityName }, { _id: 1, name_Shop: 1 });
        const products = yield productModel_1.ProductModel.aggregate([
            {
                $match: {
                    $and: [
                        { name: { $regex: search } },
                        { isActive: true }
                    ],
                },
            },
            {
                $lookup: {
                    from: ShopModel_1.ShopModel.collection.name,
                    localField: 'shopId',
                    foreignField: '_id',
                    as: 'shop',
                },
            },
            {
                $match: {
                    $and: [
                        { 'shop.address.cityName': cityName },
                        { 'shop.shopActive': true },
                    ],
                },
            },
            {
                $project: {
                    _id: 1, name: 1, priceDescription: 1,
                    shop: { _id: 1, name_Shop: 1 }
                }
            }
        ]);
        res.status(200).json({
            status: 200, success: true, mainCategory, SubCategory, sub_SubCategory, shops, products
        });
    }
    catch (error) {
        next({ error, status: 400 });
    }
});
exports.getNameSearch = getNameSearch;
const logoutShop = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        res.clearCookie("shop");
        res.status(201).json({
            status: 201, success: true,
            message: " از حساب فروشگاهی خود خارج شدید "
        });
    }
    catch (error) {
        next({ error, status: 400 });
    }
});
exports.logoutShop = logoutShop;
