"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubCatRouter = void 0;
const express_1 = __importDefault(require("express"));
const multer_1 = require("../moduls/multer");
const checkLogin_1 = require("../middleWare/checkLogin");
const SubCategoryController_1 = require("../controller/SubCategoryController");
const roleCheck_1 = require("../validation/roleCheck");
const setAddress_1 = require("../moduls/setAddress");
const SubCatRouter = (0, express_1.default)();
exports.SubCatRouter = SubCatRouter;
SubCatRouter.post("/", checkLogin_1.checkLogin, (0, roleCheck_1.checkRole)("subCategory", "create"), multer_1.upload.single("sub-cat"), SubCategoryController_1.addSubCategory);
SubCatRouter.get("/one-sub-category", setAddress_1.setLocation, SubCategoryController_1.getOneSubCategory);
SubCatRouter.get("/one-second-category", setAddress_1.setLocation, SubCategoryController_1.getOneSubSubCategory);
SubCatRouter.put("/", checkLogin_1.checkLogin, (0, roleCheck_1.checkRole)("subCategory", "update"), multer_1.upload.single("sub-cat"), SubCategoryController_1.updateSubCategory);
SubCatRouter.delete("/", checkLogin_1.checkLogin, (0, roleCheck_1.checkRole)("subCategory", "delete"), SubCategoryController_1.deleteSubCategory);
SubCatRouter.post("/second-category", checkLogin_1.checkLogin, (0, roleCheck_1.checkRole)("subCategory", "update"), multer_1.upload.single("sub-cat"), SubCategoryController_1.CreateSub_SubCategory);
SubCatRouter.put("/second-category", checkLogin_1.checkLogin, (0, roleCheck_1.checkRole)("subCategory", "update"), multer_1.upload.single("sub-cat"), SubCategoryController_1.UpdateSub_SubCategory);
SubCatRouter.delete("/second-category", checkLogin_1.checkLogin, (0, roleCheck_1.checkRole)("subCategory", "update"), SubCategoryController_1.DeleteSub_SubCategory);
