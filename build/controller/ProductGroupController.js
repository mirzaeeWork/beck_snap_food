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
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteProductGroup = exports.setproductsGroup = exports.getOneProductGroupTrue = exports.getOneProductGroup = exports.updateProductGroup = exports.addProductGroup = void 0;
const ProductsGroupModel_1 = require("../models/ProductsGroupModel");
const mongoose_1 = __importStar(require("mongoose"));
const productModel_1 = require("../models/productModel");
const addProductGroup = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { title } = req.body;
        if (!title || title.length < 3)
            throw { message: "عنوان گروه محصولات حداقل شامل 3 کاراکتر باشد" };
        const options = {
            new: true,
            upsert: true,
        };
        console.log(req.shopId);
        const ProductsGroup = yield ProductsGroupModel_1.ProductsGroupModel.findOneAndUpdate({ title: title, shopId: req.shopId }, { $set: { title: title, shopId: req.shopId } }, options);
        if (!ProductsGroup)
            throw { message: "گروه محصولات ایجاد نشد" };
        res.status(201).json({
            status: 201, success: true,
            message: "گروه محصولات با موفقیت ایجاد شد"
        });
    }
    catch (error) {
        next({ error, status: 400 });
    }
});
exports.addProductGroup = addProductGroup;
const updateProductGroup = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { _id, title } = req.body;
        if (!(0, mongoose_1.isValidObjectId)(_id))
            throw { message: "شناسه معتبر نمی باشد" };
        if (!title || title.length < 3)
            throw { message: "عنوان گروه محصولات حداقل شامل 3 کاراکتر باشد" };
        const prodGroup = yield ProductsGroupModel_1.ProductsGroupModel.findOne({ title });
        if (prodGroup && prodGroup._id != _id)
            throw { message: "عنوان گروه تکراری می باشد" };
        const result = yield ProductsGroupModel_1.ProductsGroupModel.updateOne({ _id, shopId: req.shopId }, { $set: { title } });
        if (!result.modifiedCount)
            throw { message: "گروه محصولات  بروزرسانی نشد" };
        res.status(201).json({
            status: 201, success: true,
            message: "گروه محصولات با موفقیت بروزرسانی شد"
        });
    }
    catch (error) {
        next({ error, status: 400 });
    }
});
exports.updateProductGroup = updateProductGroup;
const getOneProductGroup = (count) => (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { _id, shopId } = req.body;
        if (!(0, mongoose_1.isValidObjectId)(_id))
            throw { message: "شناسه معتبر نمی باشد" };
        let match, match2;
        if (count == 1) {
            match = {
                _id: new mongoose_1.default.Types.ObjectId(_id),
                shopId: new mongoose_1.default.Types.ObjectId(req.shopId),
            };
        }
        else if (count == 2) {
            if (!(0, mongoose_1.isValidObjectId)(shopId))
                throw { message: "شناسه معتبر نمی باشد" };
            match = {
                _id: new mongoose_1.default.Types.ObjectId(_id),
                shopId: new mongoose_1.default.Types.ObjectId(shopId),
            };
        }
        const productGroup = yield ProductsGroupModel_1.ProductsGroupModel.aggregate([
            {
                $match: match,
            },
            {
                $lookup: {
                    from: productModel_1.ProductModel.collection.name,
                    let: { productsGroupId: "$_id" },
                    pipeline: [
                        { $match: { $expr: { $eq: ["$productsGroupId", "$$productsGroupId"] } } },
                    ],
                    as: "Product",
                },
            },
            {
                $project: {
                    __v: 0, updatedAt: 0, createdAt: 0,
                    Products: { __v: 0, updatedAt: 0, createdAt: 0 }
                },
            },
        ]);
        if (!productGroup.length)
            throw { message: "این فروشگاه این گروه محصولات را ندارد" };
        res.status(201).json({
            status: 201, success: true,
            productGroup
        });
    }
    catch (error) {
        next({ error, status: 400 });
    }
});
exports.getOneProductGroup = getOneProductGroup;
const getOneProductGroupTrue = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { _id, shopId } = req.body;
        if (!(0, mongoose_1.isValidObjectId)(_id))
            throw { message: "شناسه معتبر نمی باشد" };
        if (!(0, mongoose_1.isValidObjectId)(shopId))
            throw { message: "شناسه معتبر نمی باشد" };
        const productGroup = yield ProductsGroupModel_1.ProductsGroupModel.aggregate([
            {
                $match: {
                    _id: new mongoose_1.default.Types.ObjectId(_id),
                    shopId: new mongoose_1.default.Types.ObjectId(shopId),
                },
            },
            {
                $lookup: {
                    from: productModel_1.ProductModel.collection.name,
                    let: { productsGroupId: "$_id" },
                    pipeline: [
                        { $match: { $expr: { $eq: ["$productsGroupId", "$$productsGroupId"] } } },
                        { $match: { isActive: true } }
                    ],
                    as: "Product",
                },
            },
            {
                $project: {
                    __v: 0, updatedAt: 0, createdAt: 0,
                    Products: { __v: 0, updatedAt: 0, createdAt: 0 }
                },
            },
        ]);
        if (!productGroup.length)
            throw { message: "این فروشگاه این گروه محصولات را ندارد" };
        res.status(201).json({
            status: 201, success: true,
            productGroup
        });
    }
    catch (error) {
        next({ error, status: 400 });
    }
});
exports.getOneProductGroupTrue = getOneProductGroupTrue;
const setproductsGroup = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { _id, shopId, startTime, endTime } = req.body;
        if (!(0, mongoose_1.isValidObjectId)(_id))
            throw { message: "شناسه معتبر نمی باشد" };
        if (!(0, mongoose_1.isValidObjectId)(shopId))
            throw { message: "شناسه معتبر نمی باشد" };
        const productGroup = yield ProductsGroupModel_1.ProductsGroupModel.findOne({ _id });
        if (!productGroup)
            throw { message: " گروه محصولات وجود ندارد" };
        if (startTime && (startTime < Date.now()))
            throw { message: " زمان شروع بایستی بیشتر از زمان حال باشد" };
        if (endTime && endTime > startTime + 24 * 60 * 60 * 1000)
            throw { message: "زمان پایان بایستی کمتر از یک روز باشد" };
        const result = yield ProductsGroupModel_1.ProductsGroupModel.updateOne({ _id, shopId }, {
            $set: { startTime, endTime }
        });
        if (!result.modifiedCount)
            throw { message: "گروه محصولات بروزرسانی نشد" };
        res.status(201).json({
            status: 201, success: true,
            message: "گروه محصولات با موفقیت بروزرسانی شد"
        });
    }
    catch (error) {
        next({ error, status: 400 });
    }
});
exports.setproductsGroup = setproductsGroup;
const deleteProductGroup = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { _id } = req.body;
        if (!(0, mongoose_1.isValidObjectId)(_id))
            throw { message: "شناسه معتبر نمی باشد" };
        const produc = yield productModel_1.ProductModel.findOne({ productsGroupId: _id });
        if (produc)
            throw { message: "ابتدا محصولات این گروه را حذف کنید" };
        const productGroup = yield ProductsGroupModel_1.ProductsGroupModel.findOneAndDelete({ _id, shopId: req.shopId });
        if (!productGroup)
            throw { message: " گروه محصولات وجود ندارد" };
        res.status(201).json({
            status: 201, success: true,
            message: "گروه محصولات با موفقیت حذف شد", produc
        });
    }
    catch (error) {
        next({ error, status: 400 });
    }
});
exports.deleteProductGroup = deleteProductGroup;
