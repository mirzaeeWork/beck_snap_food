"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userRouter = void 0;
const express_1 = __importDefault(require("express"));
const userController_1 = require("../controller/userController");
const checkLogin_1 = require("../middleWare/checkLogin");
const roleCheck_1 = require("../validation/roleCheck");
const userRouter = (0, express_1.default)();
exports.userRouter = userRouter;
userRouter.post("/", userController_1.reqOTPuser);
userRouter.post("/signup-login", userController_1.sendOTPuser);
userRouter.get("/get-profile", checkLogin_1.checkLogin, userController_1.getProfile);
userRouter.post("/create-address", checkLogin_1.checkLogin, userController_1.createAddress);
userRouter.get("/select-address", checkLogin_1.checkLogin, userController_1.selectAddress);
userRouter.post("/update-address", checkLogin_1.checkLogin, userController_1.updateAddress);
userRouter.get("/get_address", checkLogin_1.checkLogin, userController_1.getAddress);
userRouter.post("/delete-address", checkLogin_1.checkLogin, userController_1.deleteAddress);
userRouter.post("/update-user", checkLogin_1.checkLogin, userController_1.updateUser);
userRouter.post("/create_link", checkLogin_1.checkLogin, userController_1.CreateLink);
userRouter.post("/by-link", userController_1.reqOTPUserBylink);
userRouter.post("/signup-by-link", userController_1.sendOTPUserBylink);
userRouter.post("/logout", checkLogin_1.checkLogin, userController_1.logout);
userRouter.post("/set-role", checkLogin_1.checkLogin, (0, roleCheck_1.checkRole)("user", "setRole"), userController_1.SetRole);
userRouter.post("/set-discount", checkLogin_1.checkLogin, (0, roleCheck_1.checkRole)("user", "update"), userController_1.SetForAllLinkDiscount);
userRouter.get("/get-user", checkLogin_1.checkLogin, (0, roleCheck_1.checkRole)("user", "read"), userController_1.getUser);
userRouter.get("/get-all-user", checkLogin_1.checkLogin, (0, roleCheck_1.checkRole)("user", "read"), userController_1.getAllUser);
userRouter.delete("/delete-user", checkLogin_1.checkLogin, (0, roleCheck_1.checkRole)("user", "delete"), userController_1.deleteUser);
