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
exports.Router = void 0;
const express_1 = __importDefault(require("express"));
const MainCategoryRouter_1 = require("./MainCategoryRouter");
const cityRout_1 = require("./cityRout");
const userRouter_1 = require("./userRouter");
const SubCategoryRouter_1 = require("./SubCategoryRouter");
const ShopRouter_1 = require("./ShopRouter");
const roleRouter_1 = require("./roleRouter");
const productGroupRouter_1 = require("./productGroupRouter");
const productRouter_1 = require("./productRouter");
const orderRouter_1 = require("./orderRouter");
const walletRouter_1 = require("./walletRouter");
const Router = express_1.default.Router();
exports.Router = Router;
Router.use("/category", MainCategoryRouter_1.CatRouter);
Router.use("/city", cityRout_1.CityRouter);
Router.use("/user", userRouter_1.userRouter);
Router.use("/sub-category", SubCategoryRouter_1.SubCatRouter);
Router.use("/shop", ShopRouter_1.ShopRouter);
Router.use("/role", roleRouter_1.roleRouter);
Router.use("/prodGroup", productGroupRouter_1.prodGroupRouter);
Router.use("/prod", productRouter_1.prodRouter);
Router.use("/order", orderRouter_1.orderRouter);
Router.use("/wallet", walletRouter_1.walletRouter);
Router.get('/', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        res.status(200).json("server is running");
    }
    catch (error) {
        next({ error, status: 400 });
    }
}));
