"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CatRouter = void 0;
const express_1 = __importDefault(require("express"));
const MainCategoryController_1 = require("../controller/MainCategoryController");
const multer_1 = require("../moduls/multer");
const checkLogin_1 = require("../middleWare/checkLogin");
const roleCheck_1 = require("../validation/roleCheck");
const setAddress_1 = require("../moduls/setAddress");
const CatRouter = (0, express_1.default)();
exports.CatRouter = CatRouter;
CatRouter.post("/", checkLogin_1.checkLogin, (0, roleCheck_1.checkRole)("mainCategory", "create"), multer_1.upload.single('main-cat'), MainCategoryController_1.addMainCategory);
CatRouter.get("/", MainCategoryController_1.getAllCategory);
CatRouter.get("/one-category", setAddress_1.setLocation, MainCategoryController_1.getOneCategory);
CatRouter.put("/", checkLogin_1.checkLogin, (0, roleCheck_1.checkRole)("mainCategory", "update"), multer_1.upload.single("main-cat"), MainCategoryController_1.updateCategory);
CatRouter.delete("/", checkLogin_1.checkLogin, (0, roleCheck_1.checkRole)("mainCategory", "delete"), MainCategoryController_1.deleteCategory);
