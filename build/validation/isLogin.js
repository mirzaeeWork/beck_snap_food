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
exports.isLogin = void 0;
const userModel_1 = __importDefault(require("../models/userModel"));
const utils_1 = require("../moduls/utils");
const isLogin = (req) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const remmemberMe = (_a = req === null || req === void 0 ? void 0 : req.cookies) === null || _a === void 0 ? void 0 : _a.remmemberMe;
    if (!remmemberMe)
        return false;
    const { phoneNumber } = (0, utils_1.verifyToken)(remmemberMe);
    let user = yield userModel_1.default.findOne({ phoneNumber });
    if (user && remmemberMe !== user.remmemberMe)
        return false;
    return true;
});
exports.isLogin = isLogin;
