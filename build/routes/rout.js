"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Router = void 0;
const express_1 = __importDefault(require("express"));
const categoryRouter_1 = require("./categoryRouter");
const cityRout_1 = require("./cityRout");
const userRouter_1 = require("./userRouter");
const Router = express_1.default.Router();
exports.Router = Router;
Router.use("/category", categoryRouter_1.CatRouter);
Router.use("/city", cityRout_1.CityRouter);
Router.use("/user", userRouter_1.userRouter);
