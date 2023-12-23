"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.roleRouter = void 0;
const express_1 = __importDefault(require("express"));
const checkLogin_1 = require("../middleWare/checkLogin");
const roleCheck_1 = require("../validation/roleCheck");
const roleController_1 = require("../controller/roleController");
const roleRouter = express_1.default.Router();
exports.roleRouter = roleRouter;
roleRouter.post("/createOwner", checkLogin_1.checkLogin, roleController_1.createOwner);
roleRouter.post("/", checkLogin_1.checkLogin, roleCheck_1.checkPermisson, roleController_1.addRole);
roleRouter.put("/", checkLogin_1.checkLogin, roleCheck_1.checkPermisson, roleController_1.UpdateRole);
roleRouter.get("/", checkLogin_1.checkLogin, roleCheck_1.checkPermisson, roleController_1.getAllRole);
roleRouter.get("/getOneRole", checkLogin_1.checkLogin, roleCheck_1.checkPermisson, roleController_1.getOneRole);
roleRouter.delete("/", checkLogin_1.checkLogin, roleCheck_1.checkPermisson, roleController_1.deleteRole);
