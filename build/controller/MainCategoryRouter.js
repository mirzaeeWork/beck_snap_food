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
exports.deleteCategory = exports.updateCategory = exports.getOneCategory = exports.getAllCategory = exports.addCategory = void 0;
const MainCategoryModel_1 = __importDefault(require("../models/MainCategoryModel"));
const addCategory = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.file)
            throw { message: "تصویر آپلود نشد" };
        const { path } = req.file;
        let url = path.replace(/\\/g, '/');
        url = url.slice(url.indexOf('/uploads'));
        const { name } = req.body;
        if (!name || name.length < 4) {
            require("fs").unlinkSync(require("path").join(__dirname, "..", "public", url));
            throw { message: "حداقل 4 کاراکتر برای نام وارد کنید" };
        }
        const MainCategory = yield MainCategoryModel_1.default.create({ name, imageUrl: url });
        if (!MainCategory)
            throw { message: "دسته بندی ایجاد نشد" };
        res.status(201).json({
            status: 201, success: true,
            message: "دسته بندی مورد نظر ایجاد شد",
        });
    }
    catch (error) {
        next({ error, status: 400 });
    }
});
exports.addCategory = addCategory;
const getAllCategory = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const MainCategory = yield MainCategoryModel_1.default.find({});
        res.status(200).json({
            status: 200, success: true,
            MainCategory
        });
    }
    catch (error) {
        next({ error, status: 400 });
    }
});
exports.getAllCategory = getAllCategory;
const getOneCategory = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { _id } = req.body;
        const MainCategory = yield MainCategoryModel_1.default.find({});
        res.status(20).json({
            status: 200, success: true,
            MainCategory
        });
    }
    catch (error) {
        next({ error, status: 400 });
    }
});
exports.getOneCategory = getOneCategory;
const updateCategory = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        res.status(201).json({
            status: 201, success: true,
            message: " شهر حذف شد"
        });
    }
    catch (error) {
        next({ error, status: 400 });
    }
});
exports.updateCategory = updateCategory;
const deleteCategory = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        res.status(201).json({
            status: 201, success: true,
            message: " شهر حذف شد"
        });
    }
    catch (error) {
        next({ error, status: 400 });
    }
});
exports.deleteCategory = deleteCategory;
