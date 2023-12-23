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
exports.checkRole = exports.checkPermisson = void 0;
const dotenv = __importStar(require("dotenv"));
const roleModel_1 = require("../models/roleModel");
const userModel_1 = require("../models/userModel");
dotenv.config();
const checkPermisson = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield userModel_1.UserModel.findOne({ phoneNumber: req.phoneNumber });
        if ((user === null || user === void 0 ? void 0 : user.role) != "OWNER")
            throw { message: "مجاز نیستید" };
        next();
    }
    catch (error) {
        res.clearCookie("rememberMe");
        next({ error, status: 400 });
    }
});
exports.checkPermisson = checkPermisson;
const checkRole = (name, crud) => (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield userModel_1.UserModel.findOne({ phoneNumber: req.phoneNumber });
        if ((user === null || user === void 0 ? void 0 : user.role) == "OWNER")
            return next();
        const role = yield roleModel_1.roleModel.findOne({
            title: user === null || user === void 0 ? void 0 : user.role,
        });
        let permission = role === null || role === void 0 ? void 0 : role.permissions.find(per => per.name == name);
        if (!(permission === null || permission === void 0 ? void 0 : permission.crud.includes(crud)))
            throw { status: 403, message: "مجاز نیستید" };
        next();
    }
    catch (error) {
        res.clearCookie("rememberMe");
        res.clearCookie("location");
        next({ error, status: 400 });
    }
});
exports.checkRole = checkRole;
