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
exports.deleteCity = exports.updateCity = exports.getCity = exports.addCity = void 0;
const cityModel_1 = __importDefault(require("../models/cityModel"));
const citySchema_1 = require("../validation/schema/citySchema");
const mongoose_1 = require("mongoose");
const addCity = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { code, title, lat, lng } = req.body;
        yield citySchema_1.citySchema.validate(req.body, { abortEarly: false });
        const city = yield cityModel_1.default.findOne({ $or: [{ code }, { title }] });
        if (city)
            throw { message: "کد یا عنوان شهر تکراری می باشد" };
        const count = yield cityModel_1.default.countDocuments({});
        const result = yield cityModel_1.default.create({
            id: (count + 1), code, title, lat, lng
        });
        res.status(201).json({
            status: 201, success: true,
            message: " با موفقیت انجام شد",
            result
        });
    }
    catch (error) {
        next({ error, status: 400 });
    }
});
exports.addCity = addCity;
const getCity = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield cityModel_1.default.find({}, { __v: 0, createdAt: 0 });
        res.status(201).json({
            status: 201, success: true,
            message: " با موفقیت انجام شد",
            result
        });
    }
    catch (error) {
        next({ error, status: 400 });
    }
});
exports.getCity = getCity;
const updateCity = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { _id, code, title, lat, lng } = req.body;
        if (!(0, mongoose_1.isValidObjectId)(_id))
            throw { message: "شناسه معتبر نمی باشد" };
        yield citySchema_1.citySchema.validate(req.body, { abortEarly: false });
        const city = yield cityModel_1.default.findOne({ $or: [{ code }, { title }] });
        if (city && (city._id != _id))
            throw { message: "کد یا عنوان شهر تکراری می باشد" };
        const find = yield cityModel_1.default.findOneAndUpdate({ _id }, { $set: { code: code, title, lat, lng } });
        if (!find)
            throw { message: "بروزرسانی انجام نشد" };
        res.status(201).json({
            status: 201, success: true,
            message: " بروزرسانی با موفقیت انجام شد"
        });
    }
    catch (error) {
        next({ error, status: 400 });
    }
});
exports.updateCity = updateCity;
const deleteCity = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { _id } = req.body;
        if (!(0, mongoose_1.isValidObjectId)(_id))
            throw { message: "شناسه معتبر نمی باشد" };
        const city = yield cityModel_1.default.deleteOne({ _id: _id });
        if (!city.deletedCount)
            throw { message: "شهر حذف نشد " };
        res.status(201).json({
            status: 201, success: true,
            message: " شهر حذف شد"
        });
    }
    catch (error) {
        next({ error, status: 400 });
    }
});
exports.deleteCity = deleteCity;
