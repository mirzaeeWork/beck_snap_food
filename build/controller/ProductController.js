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
exports.setproduct = exports.getOneProduct = exports.deleteProduct = exports.setavailableProduct = exports.updateProduct = exports.addProduct = void 0;
const productSchema_1 = require("../validation/schema/productSchema");
const utils_1 = require("../moduls/utils");
const mongoose_1 = require("mongoose");
const productModel_1 = require("../models/productModel");
const ProductsGroupModel_1 = require("../models/ProductsGroupModel");
const mongoose_2 = __importDefault(require("mongoose"));
const ShopModel_1 = require("../models/ShopModel");
const addProduct = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.file)
            throw { message: "تصویر آپلود نشد" };
        const { path } = req.file;
        let url = path.replace(/\\/g, '/');
        url = url.slice(url.indexOf('/uploads'));
        const { name, description, productsGroupId, priceDescription } = req.body;
        const priceDescriptions = priceDescription === null || priceDescription === void 0 ? void 0 : priceDescription.map((item) => JSON.parse(item));
        if (!(0, mongoose_1.isValidObjectId)(productsGroupId))
            throw (0, utils_1.handleFileError)("شناسه معتبر نمی باشد", url);
        if (!name || !description)
            throw (0, utils_1.handleFileError)("نام و توضیحات وارد شود", url);
        yield (0, productSchema_1.productValidation)(name, description, priceDescriptions, url);
        const prod = yield productModel_1.ProductModel.findOne({ name, productsGroupId });
        if (prod)
            throw (0, utils_1.handleFileError)("این نام تکراری می باشد", url);
        const productGroup = yield ProductsGroupModel_1.ProductsGroupModel.findOne({ shopId: req.shopId, _id: productsGroupId });
        if (!productGroup)
            throw (0, utils_1.handleFileError)("گروه محصولات وجود ندارد", url);
        const product = yield productModel_1.ProductModel.create({
            name, description, productsGroupId, shopId: req.shopId,
            priceDescription: priceDescriptions, imageUrl: url
        });
        if (!product)
            throw (0, utils_1.handleFileError)("محصول ایجاد نشد", url);
        res.status(201).json({
            status: 201, success: true,
            message: "محصول مورد نظر ایجاد شد",
        });
    }
    catch (error) {
        next({ error, status: 400 });
    }
});
exports.addProduct = addProduct;
const updateProduct = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.file)
            throw { message: "تصویر آپلود نشد" };
        const { path } = req.file;
        let url = path.replace(/\\/g, '/');
        url = url.slice(url.indexOf('/uploads'));
        const { _id, name, description, productsGroupId, priceDescription, discount, remainderCcount } = req.body;
        const priceDescriptions = priceDescription === null || priceDescription === void 0 ? void 0 : priceDescription.map((item) => JSON.parse(item));
        if (!(0, mongoose_1.isValidObjectId)(_id))
            throw (0, utils_1.handleFileError)("شناسه معتبر نمی باشد", url);
        if (!(0, mongoose_1.isValidObjectId)(productsGroupId))
            throw (0, utils_1.handleFileError)("شناسه معتبر نمی باشد", url);
        if (!name || !description)
            throw (0, utils_1.handleFileError)("نام و توضیحات وارد شود", url);
        yield (0, productSchema_1.productUpdateValidation)(name, description, priceDescriptions, url, discount, remainderCcount);
        const prod = yield productModel_1.ProductModel.findOne({ name, productsGroupId });
        if (prod && prod._id != _id && prod.productsGroupId == productsGroupId)
            throw (0, utils_1.handleFileError)("این نام تکراری می باشد", url);
        const result = yield productModel_1.ProductModel.updateOne({ _id }, {
            $set: {
                name, description, productsGroupId,
                priceDescription: priceDescriptions, discount, remainderCcount, imageUrl: url, isActive: false
            }
        });
        if (!result.modifiedCount)
            throw { message: "محصول بروزرسانی نشد" };
        res.status(201).json({
            status: 201, success: true,
            message: "محصول مورد نظر  با موفقیت بروزرسانی شد",
        });
    }
    catch (error) {
        next({ error, status: 400 });
    }
});
exports.updateProduct = updateProduct;
const setavailableProduct = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { _id, isAvailable } = req.body;
        if (!(0, mongoose_1.isValidObjectId)(_id))
            throw { message: "شناسه معتبر نمی باشد" };
        if (typeof (isAvailable) != 'boolean')
            throw { message: "مقدار بایستی از نوع بولین باشد" };
        const result = yield productModel_1.ProductModel.updateOne({ _id }, { $set: { isAvailable: isAvailable } });
        if (!result.modifiedCount)
            throw { message: "محصول بروزرسانی نشد" };
        res.status(201).json({
            status: 201, success: true,
            message: "محصول مورد نظر  ناموجود یا موجود شد",
        });
    }
    catch (error) {
        next({ error, status: 400 });
    }
});
exports.setavailableProduct = setavailableProduct;
const deleteProduct = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { _id } = req.body;
        if (!(0, mongoose_1.isValidObjectId)(_id))
            throw { message: "شناسه معتبر نمی باشد" };
        const product = yield productModel_1.ProductModel.findOneAndDelete({ _id, shopId: req.shopId });
        if (!product)
            throw { message: "محصول وجود ندارد" };
        const aggregationResult = yield productModel_1.ProductModel.aggregate([
            {
                $match: { shopId: product.shopId, isActive: true }
            },
            {
                $unwind: "$priceDescription"
            },
            {
                $group: {
                    _id: "$shopId",
                    totalPrices: { $sum: "$priceDescription.price" },
                    count: { $sum: 1 }
                }
            },
            {
                $project: {
                    _id: 0,
                    averagePrice: { $ceil: { $divide: ["$totalPrices", "$count"] } }
                }
            }
        ]);
        const averagePrice = ((_a = aggregationResult[0]) === null || _a === void 0 ? void 0 : _a.averagePrice) || 0;
        const result = yield ShopModel_1.ShopModel.updateOne({ _id: product.shopId }, { $set: { ProductPriceAvg: averagePrice } });
        if (!result.modifiedCount)
            throw { message: "فروشگاه بروزرسانی نشد" };
        res.status(201).json({
            status: 201, success: true,
            message: " محصول با موفقیت حذف شد"
        });
    }
    catch (error) {
        next({ error, status: 400 });
    }
});
exports.deleteProduct = deleteProduct;
const getOneProduct = (count) => (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { _id, shopId } = req.body;
        if (!(0, mongoose_1.isValidObjectId)(_id))
            throw { message: "شناسه معتبر نمی باشد" };
        let filter;
        if (count == 1) {
            filter = {
                _id: new mongoose_2.default.Types.ObjectId(_id),
                shopId: new mongoose_2.default.Types.ObjectId(req.shopId),
            };
        }
        else if (count == 2) {
            if (!(0, mongoose_1.isValidObjectId)(shopId))
                throw { message: "شناسه معتبر نمی باشد" };
            filter = {
                _id: new mongoose_2.default.Types.ObjectId(_id),
                shopId: new mongoose_2.default.Types.ObjectId(shopId),
                isActive: true
            };
        }
        else if (count == 3) {
            if (!(0, mongoose_1.isValidObjectId)(shopId))
                throw { message: "شناسه معتبر نمی باشد" };
            filter = {
                _id: new mongoose_2.default.Types.ObjectId(_id),
                shopId: new mongoose_2.default.Types.ObjectId(shopId),
            };
        }
        const product = yield productModel_1.ProductModel.findOne(filter);
        if (!product)
            throw { message: "محصول وجود ندارد" };
        res.status(201).json({
            status: 201, success: true,
            product
        });
    }
    catch (error) {
        next({ error, status: 400 });
    }
});
exports.getOneProduct = getOneProduct;
const setproduct = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _b;
    try {
        const { _id, isActive } = req.body;
        if (!(0, mongoose_1.isValidObjectId)(_id))
            throw { message: "شناسه معتبر نمی باشد" };
        if (typeof (isActive) != 'boolean')
            throw { message: "مقدار بایستی از نوع بولین باشد" };
        const product = yield productModel_1.ProductModel.findOneAndUpdate({ _id }, {
            $set: { isActive: isActive }
        });
        if (!product)
            throw { message: "محصول بروزرسانی نشد" };
        const aggregationResult = yield productModel_1.ProductModel.aggregate([
            {
                $match: { shopId: product.shopId, isActive: true }
            },
            {
                $unwind: "$priceDescription"
            },
            {
                $group: {
                    _id: "$shopId",
                    totalPrices: { $sum: "$priceDescription.price" },
                    count: { $sum: 1 }
                }
            },
            {
                $project: {
                    _id: 0,
                    averagePrice: { $ceil: { $divide: ["$totalPrices", "$count"] } }
                }
            }
        ]);
        const averagePrice = ((_b = aggregationResult[0]) === null || _b === void 0 ? void 0 : _b.averagePrice) || 0;
        const result = yield ShopModel_1.ShopModel.updateOne({ _id: product.shopId }, { $set: { ProductPriceAvg: averagePrice } });
        if (!result.modifiedCount)
            throw { message: "فروشگاه بروزرسانی نشد" };
        res.status(201).json({
            status: 201, success: true,
            message: "محصول با موفقیت بروزرسانی شد", averagePrice
        });
    }
    catch (error) {
        next({ error, status: 400 });
    }
});
exports.setproduct = setproduct;
