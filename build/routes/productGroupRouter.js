"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.prodGroupRouter = void 0;
const express_1 = __importDefault(require("express"));
const ProductGroupController_1 = require("../controller/ProductGroupController");
const checkLogin_1 = require("../middleWare/checkLogin");
const roleCheck_1 = require("../validation/roleCheck");
const prodGroupRouter = express_1.default.Router();
exports.prodGroupRouter = prodGroupRouter;
prodGroupRouter.post("/", checkLogin_1.checkLoginShop, ProductGroupController_1.addProductGroup);
prodGroupRouter.put("/", checkLogin_1.checkLoginShop, ProductGroupController_1.updateProductGroup);
prodGroupRouter.delete("/", checkLogin_1.checkLoginShop, ProductGroupController_1.deleteProductGroup);
prodGroupRouter.get("/seller", checkLogin_1.checkLoginShop, (0, ProductGroupController_1.getOneProductGroup)(1));
prodGroupRouter.get("/", ProductGroupController_1.getOneProductGroupTrue);
prodGroupRouter.patch("/", checkLogin_1.checkLogin, (0, roleCheck_1.checkRole)("productGroup", "update"), ProductGroupController_1.setproductsGroup);
prodGroupRouter.get("/products-group", checkLogin_1.checkLogin, (0, roleCheck_1.checkRole)("productGroup", "read"), (0, ProductGroupController_1.getOneProductGroup)(2));
