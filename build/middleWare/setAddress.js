"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setLocation = exports.setLocationCookie = exports.getLatLng = void 0;
const dotenv = __importStar(require("dotenv"));
const userCheck_1 = require("../validation/userCheck");
const utils_1 = require("../moduls/utils");
const addressSchema_1 = require("../validation/schema/addressSchema");
dotenv.config();
const getLatLng = (city, address) => __awaiter(void 0, void 0, void 0, function* () {
    const newAddress = city + ' ' + address;
    try {
        const response = yield fetch(`https://api.neshan.org/v4/geocoding?address=${newAddress}`, {
            headers: {
                'Api-Key': `${process.env.Api_Key_Neshon}`,
            },
        });
        if (!response.ok) {
            throw new Error(`Error: ${response.status}`);
        }
        const data = yield response.json();
        if (data === null || data === void 0 ? void 0 : data.location) {
            const newLocation = data.location;
            let lat = newLocation.y.toString();
            let lng = newLocation.x.toString();
            return { lat, lng };
        }
        return "";
    }
    catch (error) {
        console.error(error);
    }
});
exports.getLatLng = getLatLng;
const setLocationCookie = (res, location) => {
    return new Promise((resolve) => {
        res.cookie("location", location, { httpOnly: true, sameSite: "strict", secure: true });
        resolve();
    });
};
exports.setLocationCookie = setLocationCookie;
const setLocation = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        if (!(yield (0, userCheck_1.isLogin)(req)) && !((_a = req === null || req === void 0 ? void 0 : req.cookies) === null || _a === void 0 ? void 0 : _a.location)) {
            const { city, address } = req === null || req === void 0 ? void 0 : req.body;
            if (!address || !city)
                throw { message: "لطفا شهر و آدرس را انتخاب کنید" };
            yield addressSchema_1.addressSchema.validate({ city, address }, { abortEarly: false });
            const result = yield (0, exports.getLatLng)(city, address);
            if (!result)
                throw { message: "طول و عرض جغرافیایی نامعتبر است" };
            const { lat, lng } = result;
            const location = (0, utils_1.createToken)({ address, lat, lng });
            yield (0, exports.setLocationCookie)(res, location);
            req.location = location;
            next();
        }
        else if ((_b = req === null || req === void 0 ? void 0 : req.cookies) === null || _b === void 0 ? void 0 : _b.location) {
            next();
        }
    }
    catch (error) {
        next({ error, status: 400 });
    }
});
exports.setLocation = setLocation;
