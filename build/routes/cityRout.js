"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CityRouter = void 0;
const express_1 = __importDefault(require("express"));
const cityController_1 = require("../controller/cityController");
const checkLogin_1 = require("../middleWare/checkLogin");
const roleCheck_1 = require("../validation/roleCheck");
const CityRouter = (0, express_1.default)();
exports.CityRouter = CityRouter;
CityRouter.post("/", checkLogin_1.checkLogin, (0, roleCheck_1.checkRole)("city", "create"), cityController_1.addCity);
CityRouter.get("/", cityController_1.getCity);
CityRouter.put("/", checkLogin_1.checkLogin, (0, roleCheck_1.checkRole)("city", "update"), cityController_1.updateCity);
CityRouter.delete("/", checkLogin_1.checkLogin, (0, roleCheck_1.checkRole)("city", "delete"), cityController_1.deleteCity);
