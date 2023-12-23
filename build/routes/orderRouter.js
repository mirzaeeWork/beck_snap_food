"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.orderRouter = void 0;
const express_1 = __importDefault(require("express"));
const checkLogin_1 = require("../middleWare/checkLogin");
const orderController_1 = require("../controller/orderController");
const roleCheck_1 = require("../validation/roleCheck");
const orderRouter = express_1.default.Router();
exports.orderRouter = orderRouter;
orderRouter.post("/", checkLogin_1.checkLogin, orderController_1.submitOrder);
orderRouter.get("/", checkLogin_1.checkLogin, (0, orderController_1.orders)(1));
orderRouter.get("/one-order", checkLogin_1.checkLogin, (0, orderController_1.orders)(2));
orderRouter.get("/orders", checkLogin_1.checkLogin, (0, roleCheck_1.checkRole)("order", "read"), (0, orderController_1.orders)(3));
orderRouter.get("/one-orders", checkLogin_1.checkLogin, (0, roleCheck_1.checkRole)("order", "read"), (0, orderController_1.orders)(4));
orderRouter.delete("/", checkLogin_1.checkLogin, (0, roleCheck_1.checkRole)("order", "delete"), orderController_1.deleteOrders);
