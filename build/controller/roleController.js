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
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOneRole = exports.getAllRole = exports.createOwner = exports.deleteRole = exports.UpdateRole = exports.addRole = void 0;
const roleModel_1 = require("../models/roleModel");
const utils_1 = require("../moduls/utils");
const roleSchema_1 = require("../validation/schema/roleSchema");
const mongoose_1 = require("mongoose");
const userModel_1 = require("../models/userModel");
const addRole = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { title, permissions } = req.body;
        if (!title || !permissions)
            throw { message: "عنوان نقش و حداقل یک عملیات وارد شود" };
        yield roleSchema_1.RoleSchema.validate({ title, permissions }, { abortEarly: false });
        const result = yield roleModel_1.roleModel.findOne({ title: title.toUpperCase() });
        if (result)
            throw { message: "عنوان نقش تکراری می باشد" };
        const role = yield roleModel_1.roleModel.create({ title: title.toUpperCase(), permissions });
        if (!role)
            throw { message: "نقش ثبت نشد" };
        res.status(201).json({
            status: 201, success: true,
            message: "نقش  با موفقیت ثبت شد"
        });
    }
    catch (error) {
        next({ error, status: 400 });
    }
});
exports.addRole = addRole;
const UpdateRole = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { _id, title, permissions } = req.body;
        if (!title || !permissions)
            throw { message: "عنوان نقش و حداقل یک عملیات وارد شود" };
        yield roleSchema_1.RoleSchema.validate({ title, permissions }, { abortEarly: false });
        if (!(0, mongoose_1.isValidObjectId)(_id))
            throw { message: "شناسه صحیح نمی باشد" };
        const role = yield roleModel_1.roleModel.findOne({ title: title.toUpperCase() });
        if (role && role._id != _id)
            throw { message: "عنوان نقش تکراری می باشد" };
        const result = yield roleModel_1.roleModel.updateOne({ _id }, { $set: { title: title.toUpperCase(), permissions } });
        if (!result.modifiedCount)
            throw { message: "نقش ثبت نشد" };
        res.status(201).json({
            status: 201, success: true,
            message: "نقش  با موفقیت بروزرسانی شد"
        });
    }
    catch (error) {
        next({ error, status: 400 });
    }
});
exports.UpdateRole = UpdateRole;
const deleteRole = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { _id } = req.body;
        if (!(0, mongoose_1.isValidObjectId)(_id))
            throw { message: "شناسه معتبر نمی باشد" };
        const role = yield roleModel_1.roleModel.deleteOne({ _id });
        if (!role.deletedCount)
            throw { message: "پیدا نشد role" };
        res.status(201).json({
            status: 201, success: true,
            message: " با موفقیت حذف شد role"
        });
    }
    catch (error) {
        next({ error, status: 400 });
    }
});
exports.deleteRole = deleteRole;
const getAllRole = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const roles = yield roleModel_1.roleModel.find();
        if (!roles)
            throw { message: "پیدا نشد role" };
        res.status(200).json({
            status: 200, success: true,
            roles
        });
    }
    catch (error) {
        next({ error, status: 400 });
    }
});
exports.getAllRole = getAllRole;
const getOneRole = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { _id } = req.body;
        if (!(0, mongoose_1.isValidObjectId)(_id))
            throw { message: "شناسه معتبر نمی باشد" };
        const role = yield roleModel_1.roleModel.find({ _id });
        if (!role.length)
            throw { message: "پیدا نشد role" };
        res.status(200).json({
            status: 200, success: true,
            role
        });
    }
    catch (error) {
        next({ error, status: 400 });
    }
});
exports.getOneRole = getOneRole;
const createOwner = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { passwordOwner } = req.body;
        if (!passwordOwner)
            throw { message: "لطفا رمز وارد شود" };
        const isValid = yield (0, utils_1.checkUserHashed)(passwordOwner, process.env.hashCheckOwner);
        if (!isValid)
            throw { message: "رمز وارد شده صحیح نمی باشد" };
        const user = yield userModel_1.UserModel.findOne({ phoneNumber: req.phoneNumber });
        if (!user)
            throw { message: "لطفا وارد حساب کاربری خود شوید" };
        user.role = "OWNER";
        user.save();
        res.status(201).json({
            status: 201, success: true,
            message: " با موفقیت انجام شد",
        });
    }
    catch (error) {
        next({ error, status: 400 });
    }
});
exports.createOwner = createOwner;
