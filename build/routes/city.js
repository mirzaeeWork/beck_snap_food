"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CityRouter = void 0;
const express_1 = __importDefault(require("express"));
const city_1 = require("../controller/city");
const CityRouter = (0, express_1.default)();
exports.CityRouter = CityRouter;
CityRouter.post("/city", city_1.addCity);
