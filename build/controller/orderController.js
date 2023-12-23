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
exports.deleteOrders = exports.orders = exports.submitOrder = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const ShopModel_1 = require("../models/ShopModel");
const productModel_1 = require("../models/productModel");
const setAddress_1 = require("../moduls/setAddress");
const orderModel_1 = require("../models/orderModel");
const persian_tools_1 = require("@persian-tools/persian-tools");
const jalali_moment_1 = __importDefault(require("jalali-moment"));
const walletModel_1 = __importDefault(require("../models/walletModel"));
const userModel_1 = require("../models/userModel");
const submitOrder = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { shopId, orderProducts, paymentMethod } = req.body;
        if (!(0, mongoose_1.isValidObjectId)(shopId))
            throw { message: "شناسه معتبر نمی باشد" };
        let prductPriceSum = 0;
        const shop = yield ShopModel_1.ShopModel.findOne({ _id: shopId });
        if (!shop)
            throw { message: "فروشگاه وجود ندارد" };
        const result = yield (0, setAddress_1.isNearAddress)(shop.address, req, next);
        if (!result)
            throw { message: "آدرس مورد تایید نیست" };
        const { distance, addressId } = result;
        if (distance > 10) {
            throw { message: "آدرس مورد نظر در محدوده سرویس دهی فروشگاه نمی باشد" };
        }
        const shippingCost = Math.ceil(distance * 1000) * 5;
        for (let index = 0; index < orderProducts.length; index++) {
            const item = orderProducts[index];
            const product = yield productModel_1.ProductModel.findOne({
                _id: item.productId,
                shopId, "priceDescription.price": item.price, isActive: true,
            }, {
                _id: 1, isAvailable: 1,
                discount: 1
            });
            if (!product || !product.isAvailable)
                throw { message: "محصول وجود ندارد" };
            if (item.discount && item.discount != product.discount)
                throw { message: "تخفیف مجاز نیست" };
            if (item.count < 1)
                throw { message: "حداقل تعداد محصول 1 می باشد" };
            const price = item.price;
            const discount = price * (item.discount / 100 || 0);
            prductPriceSum += ((price - discount) * item.count);
        }
        if (prductPriceSum < 100000)
            throw { message: "حداقل خرید 100 هزار تومان است" };
        const paymentMethods = ["online", "wallet"];
        if (!paymentMethods.includes(paymentMethod))
            throw { message: "روش پرداختی پشتیبانی نمی شود" };
        const salesTax = prductPriceSum * ((shop.salesTax || 0) / 100);
        const orderSum = prductPriceSum + shippingCost + salesTax;
        const currentDate = new Date();
        const persianDate = (0, jalali_moment_1.default)(currentDate).locale('fa').format('dddd jD jMMMM  HH:mm jYYYY');
        let paymentOnline = orderSum;
        if (req.friendLinkForMe || req.myLinkForFriends) {
            const { message, discountForLink } = yield DiscountForInvitationLink(paymentOnline, req);
            if (message)
                throw { message };
            if (discountForLink || discountForLink == 0)
                paymentOnline = discountForLink;
        }
        if (paymentMethod == "wallet") {
            const { message, wallet } = yield Wallet(paymentOnline, req);
            if (message)
                throw { message };
            if (wallet || wallet == 0)
                paymentOnline = wallet;
        }
        const paymentStatus = "موفق";
        const order = yield orderModel_1.OrderModel.create({
            userPhoneNumber: req.phoneNumber, shopId, orderProducts, prductPriceSum,
            shippingCost, paymentMethod, orderSum, addressId, date: persianDate, paymentStatus, paymentOnline
        });
        if (!order)
            throw { message: "سفارش ثبت نشد" };
        res.status(201).json({
            status: 201, success: true,
            message: "سفارش مورد نظر ثبت شد", order
        });
    }
    catch (error) {
        next({ error, status: 400 });
    }
});
exports.submitOrder = submitOrder;
const orders = (count) => (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let filter;
        if (count == 1) {
            filter = { userPhoneNumber: req.phoneNumber };
        }
        else if (count == 2) {
            const { _id } = req.body;
            if (!(0, mongoose_1.isValidObjectId)(_id))
                throw { message: "شناسه معتبر نمی باشند" };
            filter = { _id: new mongoose_1.default.Types.ObjectId(_id), userPhoneNumber: req.phoneNumber };
        }
        else if (count == 3) {
            let { phoneNumber } = req.body;
            if (!(0, persian_tools_1.phoneNumberValidator)(phoneNumber))
                throw { message: "شماره موبایل وارد شده صحیح نمی باشد." };
            phoneNumber = (0, persian_tools_1.phoneNumberNormalizer)(phoneNumber, "0");
            filter = { userPhoneNumber: phoneNumber };
        }
        else if (count == 4) {
            let { _id, phoneNumber } = req.body;
            if (!(0, mongoose_1.isValidObjectId)(_id))
                throw { message: "شناسه معتبر نمی باشند" };
            if (!(0, persian_tools_1.phoneNumberValidator)(phoneNumber))
                throw { message: "شماره موبایل وارد شده صحیح نمی باشد." };
            phoneNumber = (0, persian_tools_1.phoneNumberNormalizer)(phoneNumber, "0");
            filter = { userPhoneNumber: phoneNumber };
        }
        const orders = yield orderModel_1.OrderModel.aggregate([
            {
                $match: filter
            },
            {
                $lookup: {
                    from: ShopModel_1.ShopModel.collection.name,
                    localField: "shopId",
                    foreignField: "_id",
                    as: "shop"
                }
            },
            {
                $lookup: {
                    from: productModel_1.ProductModel.collection.name,
                    localField: "orderProducts.productId",
                    foreignField: "_id",
                    as: "products"
                }
            },
            {
                $addFields: {
                    products: {
                        $map: {
                            input: "$orderProducts",
                            as: "orderProduct",
                            in: {
                                _id: "$$orderProduct.productId",
                                name: {
                                    $arrayElemAt: [
                                        "$products.name",
                                        { $indexOfArray: ["$products._id", "$$orderProduct.productId"] }
                                    ]
                                },
                                imageUrl: {
                                    $arrayElemAt: [
                                        "$products.imageUrl",
                                        { $indexOfArray: ["$products._id", "$$orderProduct.productId"] }
                                    ]
                                },
                                priceDescription: {
                                    $filter: {
                                        input: {
                                            $arrayElemAt: [
                                                "$products.priceDescription",
                                                { $indexOfArray: ["$products._id", "$$orderProduct.productId"] }
                                            ]
                                        },
                                        as: "item",
                                        cond: {
                                            $eq: ["$$item.price", "$$orderProduct.price"]
                                        }
                                    }
                                },
                                count: "$$orderProduct.count",
                                discount: "$$orderProduct.discount"
                            }
                        }
                    }
                }
            },
            {
                $project: {
                    _id: 1,
                    shop: { _id: 1, name_Shop: 1, brandImgUrl: 1, salesTax: 1 },
                    products: 1,
                    prductPriceSum: 1,
                    shippingCost: 1,
                    orderSum: 1,
                    date: 1,
                    paymentStatus: 1
                }
            }
        ]);
        res.status(201).json({
            status: 201, success: true,
            orders
        });
    }
    catch (error) {
        next({ error, status: 400 });
    }
});
exports.orders = orders;
const Wallet = (paymentOnline, req) => __awaiter(void 0, void 0, void 0, function* () {
    const wallet = yield walletModel_1.default.findOne({ userPhoneNumber: req.phoneNumber }, { IncreaseCredit: 1 });
    if (!wallet || wallet.IncreaseCredit == 0) {
        return { message: "", wallet: paymentOnline };
    }
    if (paymentOnline > wallet.IncreaseCredit) {
        paymentOnline = paymentOnline - wallet.IncreaseCredit;
        wallet.IncreaseCredit = 0;
    }
    else {
        wallet.IncreaseCredit = wallet.IncreaseCredit - paymentOnline;
        paymentOnline = 0;
    }
    wallet.save();
    return { message: "", wallet: paymentOnline };
});
const DiscountForInvitationLink = (paymentOnline, req) => __awaiter(void 0, void 0, void 0, function* () {
    if (!(yield orderModel_1.OrderModel.findOne({ userPhoneNumber: req.phoneNumber }))) {
        if (req.discountForLink && req.friendLinkForMe) {
            paymentOnline = paymentOnline - req.discountForLink;
            const inviter = yield userModel_1.UserModel.updateOne({ myLinkForFriends: req.friendLinkForMe }, {
                $inc: { numFriendsRegWithMyLink: 1 }
            });
            if (!inviter.modifiedCount)
                return { message: "دعوت کننده بروزرسانی نشد", discountForLink: paymentOnline };
        }
        if (req.discountForLink && req.myLinkForFriends) {
            const user = yield userModel_1.UserModel.findOne({ phoneNumber: req.phoneNumber });
            if ((user === null || user === void 0 ? void 0 : user.numFriendsRegWithMyLink) && (user === null || user === void 0 ? void 0 : user.discountForLink)) {
                paymentOnline = paymentOnline - user.discountForLink;
                user.numFriendsRegWithMyLink -= 1;
                user.save();
            }
        }
    }
    else {
        const user = yield userModel_1.UserModel.findOne({ phoneNumber: req.phoneNumber });
        if ((user === null || user === void 0 ? void 0 : user.numFriendsRegWithMyLink) && (user === null || user === void 0 ? void 0 : user.discountForLink)) {
            paymentOnline = paymentOnline - user.discountForLink;
            user.numFriendsRegWithMyLink -= 1;
            user.save();
        }
    }
    return { message: "", discountForLink: paymentOnline };
});
const deleteOrders = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { phoneNumber } = req.body;
        if (!(0, persian_tools_1.phoneNumberValidator)(phoneNumber))
            throw { message: "شماره موبایل وارد شده صحیح نمی باشد." };
        const phone = (0, persian_tools_1.phoneNumberNormalizer)(phoneNumber, "0");
        const result = yield orderModel_1.OrderModel.deleteMany({ userPhoneNumber: phone });
        if (!result.deletedCount)
            throw { message: "سفارشات حذف نشد" };
        res.status(200).json({
            status: 200, success: true,
            message: "سفارشات کاربر مورد نظر حذف شد"
        });
    }
    catch (error) {
        next({ error, status: 400 });
    }
});
exports.deleteOrders = deleteOrders;
