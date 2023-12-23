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
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkCookie = exports.isLogin = void 0;
const utils_1 = require("../moduls/utils");
const userModel_1 = require("../models/userModel");
const isLogin = (req) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const rememberMe = (_a = req === null || req === void 0 ? void 0 : req.cookies) === null || _a === void 0 ? void 0 : _a.rememberMe;
    if (!rememberMe)
        return false;
    const { phoneNumber } = (0, utils_1.verifyToken)(rememberMe);
    let user = yield userModel_1.UserModel.findOne({ phoneNumber });
    if (!user)
        return false;
    return true;
});
exports.isLogin = isLogin;
const checkCookie = (phoneNumber) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield userModel_1.UserModel.findOne({ phoneNumber, name: { $exists: true, $ne: null }, lastName: { $exists: true, $ne: null } });
});
exports.checkCookie = checkCookie;
