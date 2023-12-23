"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Sub_SubCatRouter = void 0;
const express_1 = __importDefault(require("express"));
const multer_1 = require("../moduls/multer");
const checkLogin_1 = require("../middleWare/checkLogin");
const Sub_SubCategoryController_1 = require("../controller/Sub-SubCategoryController");
const Sub_SubCatRouter = (0, express_1.default)();
exports.Sub_SubCatRouter = Sub_SubCatRouter;
Sub_SubCatRouter.post("/", checkLogin_1.checkLogin, multer_1.upload.single("sub-cat"), Sub_SubCategoryController_1.addSub_SubCategory);
