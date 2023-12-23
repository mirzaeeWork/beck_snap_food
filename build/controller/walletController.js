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
exports.deleteWallet = exports.getWallet = exports.addAndUpdateWallet = void 0;
const walletModel_1 = __importDefault(require("../models/walletModel"));
const persian_tools_1 = require("@persian-tools/persian-tools");
const addAndUpdateWallet = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { IncreaseCredit } = req.body;
        if (IncreaseCredit < 1000)
            throw { message: "افزایش اعتبار بایستی بزرگتر مساوی 1000 تومان باشد" };
        const options = {
            new: true,
            upsert: true,
        };
        const wallet = yield walletModel_1.default.findOneAndUpdate({ userPhoneNumber: req.phoneNumber }, { $inc: { IncreaseCredit: IncreaseCredit } }, options);
        if (!wallet)
            throw { message: "کیف پول ایجاد یا بروزرسانی نشد" };
        res.status(201).json({
            status: 201, success: true,
            message: "افزایش اعتبار انجام شد", wallet
        });
    }
    catch (error) {
        next({ error, status: 400 });
    }
});
exports.addAndUpdateWallet = addAndUpdateWallet;
const getWallet = (count) => (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let phone = "";
        if (count == 1) {
            phone = req.phoneNumber || "";
        }
        else if (count == 2) {
            const { phoneNumber } = req.body;
            if (!(0, persian_tools_1.phoneNumberValidator)(phoneNumber))
                throw { message: "شماره موبایل وارد شده صحیح نمی باشد." };
            phone = (0, persian_tools_1.phoneNumberNormalizer)(phoneNumber, "0");
        }
        const wallet = yield walletModel_1.default.findOne({ userPhoneNumber: phone }, { __v: 0, createdAt: 0, updatedAt: 0 });
        res.status(200).json({
            status: 200, success: true,
            wallet
        });
    }
    catch (error) {
        next({ error, status: 400 });
    }
});
exports.getWallet = getWallet;
const deleteWallet = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { phoneNumber } = req.body;
        if (!(0, persian_tools_1.phoneNumberValidator)(phoneNumber))
            throw { message: "شماره موبایل وارد شده صحیح نمی باشد." };
        const phone = (0, persian_tools_1.phoneNumberNormalizer)(phoneNumber, "0");
        const result = yield walletModel_1.default.deleteOne({ userPhoneNumber: phone });
        if (!result.deletedCount)
            throw { message: "کیف پول حذف نشد" };
        res.status(200).json({
            status: 200, success: true,
            message: "کیف پول کاربر مورد نظر حذف شد"
        });
    }
    catch (error) {
        next({ error, status: 400 });
    }
});
exports.deleteWallet = deleteWallet;
