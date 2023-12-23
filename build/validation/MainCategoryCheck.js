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
exports.checkEntrances = void 0;
const MainCategoryModel_1 = __importDefault(require("../models/MainCategoryModel"));
const checkEntrances = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log(req.body);
        const { name } = req.body;
        if (!name || name.length < 4)
            throw { message: "حداقل 4 کاراکتر برای نام وارد کنید" };
        const mainCategory = yield MainCategoryModel_1.default.findOne({ name });
        if (mainCategory)
            throw { message: "دسته بندی تکراری می باشد" };
        next();
    }
    catch (error) {
        next({ error, status: 400 });
    }
});
exports.checkEntrances = checkEntrances;
