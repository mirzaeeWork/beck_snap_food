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
exports.addSub_SubCategory = void 0;
const mongoose_1 = require("mongoose");
const utils_1 = require("../moduls/utils");
const subCategotyModel_1 = __importDefault(require("../models/subCategotyModel"));
const Sub_subcategoryModel_1 = __importDefault(require("../models/Sub-subcategoryModel "));
const addSub_SubCategory = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.file)
            throw { message: "تصویر آپلود نشد" };
        const { path } = req.file;
        let url = path.replace(/\\/g, '/');
        url = url.slice(url.indexOf('/uploads'));
        const { name, subCategoryId } = req.body;
        if (!name || name.length < 3)
            (0, utils_1.handleFileError)("حداقل 3 کاراکتر برای نام وارد کنید", url);
        if (!(0, mongoose_1.isValidObjectId)(subCategoryId))
            (0, utils_1.handleFileError)("زیر مجموعه مورد نظر یافت نشد", url);
        const result = yield subCategotyModel_1.default.findOne({ _id: subCategoryId });
        if (!result)
            (0, utils_1.handleFileError)(" زیر مجموعه مورد نظر وجو ندارد نشد", url);
        const SubCategory = yield Sub_subcategoryModel_1.default.create({ name, imageUrl: url, subCategoryId });
        if (!SubCategory)
            (0, utils_1.handleFileError)(" مجموعه ثانویه ایجاد نشد", url);
        res.status(201).json({
            status: 201, success: true,
            message: " مجموعه ثانویه مورد نظر ایجاد شد",
        });
    }
    catch (error) {
        next({ error, status: 400 });
    }
});
exports.addSub_SubCategory = addSub_SubCategory;
