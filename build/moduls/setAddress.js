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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isNearAddress = exports.showAdresses = exports.setCookieLocation = exports.setAddressForUser = exports.setLocation = exports.setLocationCookie = exports.getLatLng = void 0;
const dotenv = __importStar(require("dotenv"));
const userCheck_1 = require("../validation/userCheck");
const utils_1 = require("./utils");
const addressSchema_1 = require("../validation/schema/addressSchema");
const cityModel_1 = __importDefault(require("../models/cityModel"));
const turf = __importStar(require("@turf/turf"));
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
    var _a;
    try {
        const location = (_a = req === null || req === void 0 ? void 0 : req.cookies) === null || _a === void 0 ? void 0 : _a.location;
        if (!(yield (0, userCheck_1.isLogin)(req)) && !location) {
            const { cityName, addressChoose } = req.body;
            if (!cityName || !addressChoose)
                throw { message: "لطفا شهر و آدرس را وارد کنید" };
            yield addressSchema_1.addressLoginSchema.validate({ cityName, addressChoose }, { abortEarly: false });
            const city = yield cityModel_1.default.findOne({ title: cityName });
            if (!city)
                throw { message: "نام شهر مجاز نمی باشد" };
            const result = yield (0, exports.getLatLng)(cityName, addressChoose);
            if (!result)
                throw { message: "طول و عرض جغرافیایی نامعتبر است" };
            const { lat, lng } = result;
            const location = (0, utils_1.createToken)({
                cityName: cityName, address: addressChoose,
                lat: lat, lng: lng
            }, "1y");
            req.location = location;
            res.cookie("location", location, {
                httpOnly: true,
                sameSite: "strict",
                secure: true,
            });
        }
        next();
    }
    catch (error) {
        next({ error, status: 400 });
    }
});
exports.setLocation = setLocation;
const setAddressForUser = (cityName, addressChoose, addressDetails) => __awaiter(void 0, void 0, void 0, function* () {
    if (!cityName || !addressChoose || !addressDetails)
        return { message: "لطفا شهر وانتخاب آدرس و جزئیات آدرس را وارد کنید" };
    yield addressSchema_1.addressLoginSchema.validate({ cityName, addressChoose, addressDetails }, { abortEarly: false });
    const city = yield cityModel_1.default.findOne({ title: cityName });
    if (!city)
        return { message: "نام شهر مجاز نمی باشد" };
});
exports.setAddressForUser = setAddressForUser;
const setCookieLocation = (address, req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!address)
            throw { message: "آدرس پیدا نشد یا بروزرسانی انجام نشد" };
        const location = (0, utils_1.createToken)({
            _id: address._id,
            cityName: address.cityName, address: address.addressChoose + ' ' + address.addressDetails,
            lat: address.geoLocation.coordinates[0], lng: address.geoLocation.coordinates[1]
        }, "1y");
        res.cookie("location", location, {
            httpOnly: true,
            sameSite: "strict",
            secure: true,
        });
    }
    catch (error) {
        next({ error, status: 400 });
    }
});
exports.setCookieLocation = setCookieLocation;
const showAdresses = (centerCoordinates, shops) => __awaiter(void 0, void 0, void 0, function* () {
    let nearbyLocations;
    if (centerCoordinates) {
        const center = turf.point([centerCoordinates.lat, centerCoordinates.lng]);
        if (shops.length) {
            nearbyLocations = shops.filter((shop) => {
                const locationCoordinates = turf.point([shop.address.lat, shop.address.lng]);
                const distance = turf.distance(center, locationCoordinates);
                return distance < 5;
            });
        }
    }
    return nearbyLocations;
});
exports.showAdresses = showAdresses;
const isNearAddress = (address, req, next) => {
    var _a;
    try {
        const location = ((_a = req === null || req === void 0 ? void 0 : req.cookies) === null || _a === void 0 ? void 0 : _a.location) || req.location;
        if (!location)
            throw { message: "ابتدا یک آدرس انتخاب کنید" };
        const { _id, lat, lng, cityName } = (0, utils_1.verifyToken)(location);
        if (address.cityName != cityName)
            throw { message: "شهر انتخابی با شهر فروشگاه متفاوت است" };
        const center = turf.point([lat, lng]);
        const locationCoordinates = turf.point(address.geoLocation.coordinates);
        const distance = turf.distance(center, locationCoordinates);
        const addressId = _id;
        return { distance, addressId };
    }
    catch (error) {
        next({ error, status: 400 });
    }
};
exports.isNearAddress = isNearAddress;
