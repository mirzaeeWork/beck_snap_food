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
exports.checkLoginShop = exports.checkAndRenewCookie = exports.checkLogin = void 0;
const utils_1 = require("../moduls/utils");
const dotenv = __importStar(require("dotenv"));
const ShopModel_1 = require("../models/ShopModel");
const userModel_1 = require("../models/userModel");
dotenv.config();
const checkLogin = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const rememberMeToken = (_a = req === null || req === void 0 ? void 0 : req.cookies) === null || _a === void 0 ? void 0 : _a.rememberMe;
        if (!rememberMeToken)
            throw { message: "لطفا وارد حساب کاربری خود شوید" };
        const { phoneNumber } = (0, utils_1.verifyToken)(rememberMeToken);
        const user = yield userModel_1.UserModel.findOne({ phoneNumber });
        if (!user)
            throw { message: "لطفا وارد حساب کاربری خود شوید" };
        req.phoneNumber = user.phoneNumber;
        req.friendLinkForMe = user.friendLinkForMe;
        req.discountForLink = user.discountForLink;
        req.myLinkForFriends = user.myLinkForFriends;
        next();
    }
    catch (error) {
        error.message = "لطفا وارد حساب کاربری خود شوید";
        res.clearCookie("rememberMe");
        res.clearCookie("location");
        next({ error, status: 400 });
    }
});
exports.checkLogin = checkLogin;
const checkAndRenewCookie = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _b, _c;
    try {
        const rememberMeToken = (_b = req === null || req === void 0 ? void 0 : req.cookies) === null || _b === void 0 ? void 0 : _b.rememberMe;
        if (!rememberMeToken) {
            next();
        }
        else {
            const { phoneNumber, exp } = (0, utils_1.verifyToken)(rememberMeToken);
            const oneMonthInMilliseconds = 6 * 30 * 24 * 60 * 60 * 1000;
            if (exp * 1000 - Date.now() > oneMonthInMilliseconds) {
                const locationToken = (_c = req === null || req === void 0 ? void 0 : req.cookies) === null || _c === void 0 ? void 0 : _c.location;
                if (locationToken) {
                    const { _id, cityName, address, lat, lng } = (0, utils_1.verifyToken)(locationToken);
                    const location = (0, utils_1.createToken)({ _id, cityName, address, lat, lng }, "1y");
                    res.cookie("location", location, {
                        httpOnly: true,
                        sameSite: "strict",
                        secure: true,
                    });
                }
                const rememberMe = (0, utils_1.createToken)({ phoneNumber }, "1y");
                res.cookie("rememberMe", rememberMe, {
                    httpOnly: true,
                    sameSite: "strict",
                    secure: true,
                });
            }
            next();
        }
    }
    catch (error) {
        next({ error, status: 400 });
    }
});
exports.checkAndRenewCookie = checkAndRenewCookie;
const checkLoginShop = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _d;
    try {
        const shopToken = (_d = req === null || req === void 0 ? void 0 : req.cookies) === null || _d === void 0 ? void 0 : _d.shop;
        if (!shopToken)
            throw { message: "لطفا وارد حساب کاربری فروشگاهی خود شوید" };
        const { name_Shop, phoneNumber } = (0, utils_1.verifyToken)(shopToken);
        const shop = yield ShopModel_1.ShopModel.findOne({ name_Shop, phoneNumber });
        if (!shop)
            throw { message: "لطفا وارد حساب کاربری فروشگاهی خود شوید" };
        req.phoneNumber_shop = phoneNumber;
        req.name_Shop = name_Shop;
        req.shopId = shop._id.toString();
        next();
    }
    catch (error) {
        error.message = "لطفا وارد حساب کاربری فروشگاهی خود شوید";
        res.clearCookie("shop");
        next({ error, status: 400 });
    }
});
exports.checkLoginShop = checkLoginShop;
