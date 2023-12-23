"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.walletRouter = void 0;
const express_1 = __importDefault(require("express"));
const checkLogin_1 = require("../middleWare/checkLogin");
const roleCheck_1 = require("../validation/roleCheck");
const walletController_1 = require("../controller/walletController");
const walletRouter = (0, express_1.default)();
exports.walletRouter = walletRouter;
walletRouter.post("/", checkLogin_1.checkLogin, walletController_1.addAndUpdateWallet);
walletRouter.get("/", checkLogin_1.checkLogin, (0, walletController_1.getWallet)(1));
walletRouter.get("/get", checkLogin_1.checkLogin, (0, roleCheck_1.checkRole)("wallet", "read"), (0, walletController_1.getWallet)(2));
walletRouter.delete("/", checkLogin_1.checkLogin, (0, roleCheck_1.checkRole)("wallet", "delete"), walletController_1.deleteWallet);
