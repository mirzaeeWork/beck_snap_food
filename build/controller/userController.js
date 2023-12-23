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
exports.logInByLink = exports.sendOTPUserBylink = exports.reqOTPUserBylink = exports.CreateLink = exports.deleteUser = exports.SetForAllLinkDiscount = exports.SetRole = exports.getAllUser = exports.getUser = exports.getProfile = exports.updateUser = exports.logout = exports.deleteAddress = exports.getAddress = exports.updateAddress = exports.selectAddress = exports.createAddress = exports.logIn = exports.signUp = exports.sendOTPuser = exports.reqOTPuser = void 0;
const persian_tools_1 = require("@persian-tools/persian-tools");
const utils_1 = require("../moduls/utils");
const userSchema_1 = require("../validation/schema/userSchema");
const setAddress_1 = require("../moduls/setAddress");
const mongoose_1 = require("mongoose");
const mongoose_2 = __importDefault(require("mongoose"));
const roleModel_1 = require("../models/roleModel");
const userModel_1 = require("../models/userModel");
const otp_generator_1 = __importDefault(require("otp-generator"));
const reqOTPuser = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const rememberMe = (_a = req === null || req === void 0 ? void 0 : req.cookies) === null || _a === void 0 ? void 0 : _a.rememberMe;
        if (rememberMe)
            throw { message: "ابتدا از حساب کاربری خود خارج شوید" };
        if ((_b = req === null || req === void 0 ? void 0 : req.cookies) === null || _b === void 0 ? void 0 : _b.location)
            res.clearCookie("location");
        let { phoneNumber } = req.body;
        if (!(0, persian_tools_1.phoneNumberValidator)(phoneNumber))
            throw { message: "شماره موبایل وارد شده صحیح نمی باشد." };
        phoneNumber = (0, persian_tools_1.phoneNumberNormalizer)(phoneNumber, "0");
        const OTP = (0, utils_1.otp_Generator)();
        const options = {
            new: true,
            upsert: true,
        };
        const user = yield userModel_1.UserModel.findOneAndUpdate({ phoneNumber }, { OTP: { value: OTP, expireIn: Date.now() + 120000 } }, options);
        if (!user)
            throw { message: "رمز یکبار مصرف ارسال نشد." };
        const req_OTP = (0, utils_1.createToken)({ phoneNumber, isValid: false }, "2m");
        res.cookie("req_OTP", req_OTP, {
            httpOnly: true,
            sameSite: "strict",
            secure: true,
        });
        res.status(201).json({ message: "رمز یکبار مصرف به شماره موبایل ارسال شد.", user });
    }
    catch (error) {
        next({ error, status: 400 });
    }
});
exports.reqOTPuser = reqOTPuser;
const sendOTPuser = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _c;
    try {
        const req_OTP = (_c = req === null || req === void 0 ? void 0 : req.cookies) === null || _c === void 0 ? void 0 : _c.req_OTP;
        if (!req_OTP)
            throw { message: "شماره موبایل را وارد کنید" };
        const { phoneNumber, isValid } = (0, utils_1.verifyToken)(req_OTP);
        const user = yield userModel_1.UserModel.findOne({ phoneNumber });
        if (!user)
            throw { message: "کاربر با شماره موبایل یافت نشد." };
        if (!isValid) {
            let { OTP } = req.body;
            if (user.OTP && user.OTP.expireIn) {
                if (OTP != user.OTP.value)
                    throw { message: "رمز یکبار مصرف ارسال شده صحیح نمیباشد." };
                if (Date.now() > user.OTP.expireIn)
                    throw { message: "رمز یکبار مصرف منقضی شده است." };
            }
            res.cookie("req_OTP", (0, utils_1.createToken)({ phoneNumber, isValid: true }, "2h"), {
                httpOnly: true,
                sameSite: "strict",
                secure: true,
            });
        }
        if (user.name && user.lastName)
            return (0, exports.logIn)(phoneNumber, user, req, res, next);
        return (0, exports.signUp)(phoneNumber, user, req, res, next);
    }
    catch (error) {
        next({ error, status: 400 });
    }
});
exports.sendOTPuser = sendOTPuser;
const signUp = (phoneNumber, user, req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (user.name && user.lastName)
            throw { message: "شما ثبت نام کرده اید" };
        let { name, lastName } = req.body;
        if (!name || !lastName)
            throw { message: "نام و نام خانوادگی را وارد نمایید" };
        yield userSchema_1.userSchema.validate({ name, lastName }, { abortEarly: false });
        const result = yield userModel_1.UserModel.updateOne({ phoneNumber: phoneNumber }, { $set: { name: name, lastName: lastName } });
        if (!result.modifiedCount)
            throw { message: "نام و نام خانوادگی ایجاد نشد" };
        const rememberMeToken = (0, utils_1.createToken)({ phoneNumber }, "1y");
        res.cookie("rememberMe", rememberMeToken, {
            httpOnly: true,
            sameSite: "strict",
            secure: true,
        });
        res.clearCookie("req_OTP");
        res.status(201).json({
            status: 201, success: true,
            message: "ثبت نام با موفقیت انجام شد"
        });
    }
    catch (error) {
        next({ error, status: 400 });
    }
});
exports.signUp = signUp;
const logIn = (phoneNumber, user, req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const length = user.address.length;
        if (length) {
            (0, setAddress_1.setCookieLocation)(user.address[0], req, res, next);
        }
        const rememberMeToken = (0, utils_1.createToken)({ phoneNumber }, "1y");
        res.cookie("rememberMe", rememberMeToken, {
            httpOnly: true,
            sameSite: "strict",
            secure: true,
        });
        res.clearCookie("req_OTP");
        res.status(200).json({
            status: 200, success: true,
            message: "شما وارد حساب کاربری خود شدید"
        });
    }
    catch (error) {
        next({ error, status: 400 });
    }
});
exports.logIn = logIn;
const createAddress = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { cityName, addressChoose, addressDetails } = req.body;
        const error = yield (0, setAddress_1.setAddressForUser)(cityName, addressChoose, addressDetails);
        if (error)
            throw error;
        const result = yield (0, setAddress_1.getLatLng)(cityName, addressChoose);
        if (!result)
            throw { message: "طول و عرض جغرافیایی نامعتبر است" };
        const { lat, lng } = result;
        const geoLocation = { type: "Point", coordinates: [lat, lng] };
        const filter = { phoneNumber: req.phoneNumber };
        const update = {
            $push: {
                address: {
                    cityName,
                    addressChoose,
                    addressDetails,
                    geoLocation
                },
            },
        };
        const options = { new: true, upsert: true };
        const user = yield userModel_1.UserModel.findOneAndUpdate(filter, update, options);
        const length = user === null || user === void 0 ? void 0 : user.address.length;
        if (length)
            (0, setAddress_1.setCookieLocation)(user.address[length - 1], req, res, next);
        res.status(201).json({
            status: 201, success: true,
            message: " آدرس تایید شد و اضافه شد"
        });
    }
    catch (error) {
        next({ error, status: 400 });
    }
});
exports.createAddress = createAddress;
const selectAddress = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { _id } = req.body;
        if (!(0, mongoose_1.isValidObjectId)(_id))
            throw { message: "شناسه معتبر نمی باشد" };
        const result = yield userModel_1.UserModel.findOne({ phoneNumber: req.phoneNumber, "address._id": _id }, { "address.$": 1 });
        if (!result)
            throw { message: "آدرس مورد نظر یافت نشد" };
        const newAddress = result.address[0];
        (0, setAddress_1.setCookieLocation)(newAddress, req, res, next);
        res.status(201).json({
            status: 201, success: true,
            message: " آدرس انتخاب شد", result
        });
    }
    catch (error) {
        next({ error, status: 400 });
    }
});
exports.selectAddress = selectAddress;
const updateAddress = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _d;
    try {
        const location = (_d = req === null || req === void 0 ? void 0 : req.cookies) === null || _d === void 0 ? void 0 : _d.location;
        if (!location)
            throw { message: "ابتدا یک آدرس انتخاب کنید" };
        const { _id } = (0, utils_1.verifyToken)(location);
        const { cityName, addressChoose, addressDetails } = req.body;
        const error = yield (0, setAddress_1.setAddressForUser)(cityName, addressChoose, addressDetails);
        if (error)
            throw error;
        const result = yield (0, setAddress_1.getLatLng)(cityName, addressChoose);
        if (!result)
            throw { message: "طول و عرض جغرافیایی نامعتبر است" };
        const { lat, lng } = result;
        const geoLocation = { type: "Point", coordinates: [lat, lng] };
        const user = yield userModel_1.UserModel.findOne({ phoneNumber: req.phoneNumber });
        if (!user) {
            throw { message: "کاربر پیدا نشد" };
        }
        user.address.filter((adr) => {
            if (adr._id == _id) {
                adr.cityName = cityName;
                adr.addressChoose = addressChoose;
                adr.addressDetails = addressDetails;
                adr.geoLocation = geoLocation;
            }
        });
        user.save();
        (0, setAddress_1.setCookieLocation)({ _id, cityName, addressChoose, addressDetails, geoLocation }, req, res, next);
        res.status(201).json({
            status: 201,
            success: true,
            message: "آدرس بروزرسانی شد", _id
        });
    }
    catch (error) {
        next({ error, status: 400 });
    }
});
exports.updateAddress = updateAddress;
const getAddress = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _e;
    try {
        const location = (_e = req === null || req === void 0 ? void 0 : req.cookies) === null || _e === void 0 ? void 0 : _e.location;
        if (!location)
            throw { message: "ابتدا یک آدرس انتخاب کنید" };
        const { _id, cityName, address, lat, lng } = (0, utils_1.verifyToken)(location);
        const addressDetails = { _id, cityName, address, lat, lng };
        res.status(201).json({
            status: 201,
            success: true,
            message: ":آدرس انتخابی شما برابر است با ", addressDetails
        });
    }
    catch (error) {
        next({ error, status: 400 });
    }
});
exports.getAddress = getAddress;
const deleteAddress = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _f;
    try {
        const { id } = req.body;
        if (!(0, mongoose_1.isValidObjectId)(id))
            throw { message: "شناسه معتبر نمی باشد" };
        const location = (_f = req === null || req === void 0 ? void 0 : req.cookies) === null || _f === void 0 ? void 0 : _f.location;
        if (!location)
            throw { message: "ابتدا یک آدرس انتخاب کنید" };
        const { _id } = (0, utils_1.verifyToken)(location);
        const result = yield userModel_1.UserModel.updateOne({ phoneNumber: req.phoneNumber }, {
            $pull: {
                address: {
                    _id: new mongoose_2.default.Types.ObjectId(id),
                },
            },
        });
        if (!result.modifiedCount)
            throw { message: "آدرس مورد نظر حذف نشد" };
        const user = yield userModel_1.UserModel.findOne({ phoneNumber: req.phoneNumber });
        if (!user)
            throw { message: "کاربر پیدا نشد" };
        const length = user.address.length;
        if (length && id == _id) {
            (0, setAddress_1.setCookieLocation)(user.address[0], req, res, next);
        }
        else if (!length) {
            res.clearCookie("location");
        }
        res.status(201).json({
            status: 201,
            success: true,
            message: "آدرس حذف شد"
        });
    }
    catch (error) {
        next({ error, status: 400 });
    }
});
exports.deleteAddress = deleteAddress;
const logout = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        res.clearCookie("rememberMe");
        res.clearCookie("location");
        res.status(201).json({
            status: 201, success: true,
            message: "با موفقیت از حساب کاربری خود خارج شدید "
        });
    }
    catch (error) {
        next({ error, status: 400 });
    }
});
exports.logout = logout;
const updateUser = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { phoneNumber } = req;
        const { name, lastName, email } = req.body;
        if (!name || !lastName)
            throw { message: "نام و نام خانوادگی را وارد نمایید" };
        yield userSchema_1.updateUserSchema.validate({ name, lastName, email }, { abortEarly: false });
        const result = yield userModel_1.UserModel.updateOne({ phoneNumber: phoneNumber }, { $set: { name: name, lastName: lastName, email: email } });
        if (!result.modifiedCount)
            throw { message: "بروزرسانی صورت نگرفت" };
        res.status(201).json({
            status: 201, success: true,
            message: "کاربر بروزرسانی شد",
        });
    }
    catch (error) {
        next({ error, status: 400 });
    }
});
exports.updateUser = updateUser;
const getProfile = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { phoneNumber } = req;
        const user = yield userModel_1.UserModel.findOne({ phoneNumber: phoneNumber }, { __v: 0, createdAt: 0, updatedAt: 0 });
        if (!user)
            throw { message: "کاربر پیدا نشد" };
        res.status(200).json({
            status: 200, success: true,
            user
        });
    }
    catch (error) {
        next({ error, status: 400 });
    }
});
exports.getProfile = getProfile;
const getUser = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let { phoneNumber } = req.body;
        if (!(0, persian_tools_1.phoneNumberValidator)(phoneNumber))
            throw { message: "شماره موبایل وارد شده صحیح نمی باشد." };
        phoneNumber = (0, persian_tools_1.phoneNumberNormalizer)(phoneNumber, "0");
        const user = yield userModel_1.UserModel.findOne({ phoneNumber: phoneNumber }, { __v: 0, createdAt: 0, updatedAt: 0 });
        if (!user)
            throw { message: "کاربر پیدا نشد" };
        res.status(200).json({
            status: 200, success: true,
            user
        });
    }
    catch (error) {
        next({ error, status: 400 });
    }
});
exports.getUser = getUser;
const getAllUser = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const users = yield userModel_1.UserModel.find({}, { __v: 0, createdAt: 0, updatedAt: 0 });
        if (!users)
            throw { message: "کاربری پیدا نشد" };
        res.status(200).json({
            status: 200, success: true,
            users
        });
    }
    catch (error) {
        next({ error, status: 400 });
    }
});
exports.getAllUser = getAllUser;
const SetRole = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let { phoneNumber, titleRole } = req.body;
        if (!(0, persian_tools_1.phoneNumberValidator)(phoneNumber))
            throw { message: "شماره موبایل وارد شده صحیح نمی باشد." };
        phoneNumber = (0, persian_tools_1.phoneNumberNormalizer)(phoneNumber, "0");
        if (!titleRole || titleRole.length < 3)
            throw { message: 'حداقل 3 کاراکتر برای عنوان نقش وارد کنید' };
        if (titleRole.toUpperCase() == "OWNER")
            throw { message: "قابل ثبت نیست OWNER نقش" };
        const role = yield roleModel_1.roleModel.findOne({ title: titleRole.toUpperCase() });
        if (!role)
            throw { message: "این نقش وجود ندارد" };
        const result = yield userModel_1.UserModel.updateOne({ phoneNumber }, { $set: { role: titleRole.toUpperCase() } });
        if (!result.modifiedCount)
            throw { message: "بروزرسانی انجام نشد" };
        res.status(200).json({
            status: 200, success: true,
            message: "بروزرسانی با موفقیت انجام شد"
        });
    }
    catch (error) {
        next({ error, status: 400 });
    }
});
exports.SetRole = SetRole;
const SetForAllLinkDiscount = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let { discountForLink } = req.body;
        if (!discountForLink || discountForLink < 10000)
            throw { message: "حداقل تخفیف برای دعوت از دوستان 10 هزار تومان است" };
        const result = yield userModel_1.UserModel.updateMany({}, { $set: { discountForLink: discountForLink } });
        if (!result.modifiedCount)
            throw { message: "بروزرسانی انجام نشد" };
        res.status(201).json({
            status: 201, success: true,
            message: "بروزرسانی با موفقیت انجام شد"
        });
    }
    catch (error) {
        next({ error, status: 400 });
    }
});
exports.SetForAllLinkDiscount = SetForAllLinkDiscount;
const deleteUser = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let { phoneNumber } = req.body;
        if (!(0, persian_tools_1.phoneNumberValidator)(phoneNumber))
            throw { message: "شماره موبایل وارد شده صحیح نمی باشد." };
        phoneNumber = (0, persian_tools_1.phoneNumberNormalizer)(phoneNumber, "0");
        const user = yield userModel_1.UserModel.deleteOne({ phoneNumber: phoneNumber });
        if (!user.deletedCount)
            throw { message: "کاربر حذف نشد" };
        res.status(201).json({
            status: 201, success: true,
            message: "کاربر حذف شد"
        });
    }
    catch (error) {
        next({ error, status: 400 });
    }
});
exports.deleteUser = deleteUser;
const CreateLink = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const random = otp_generator_1.default.generate(6);
        const link = req.protocol + "://" + req.get("host") + `/refer?referrer=${random}`;
        const result = yield userModel_1.UserModel.updateOne({ phoneNumber: req.phoneNumber }, { $set: { myLinkForFriends: link } });
        if (!result.modifiedCount)
            throw { message: "بروزرسانی صورت نگرفت" };
        res.status(201).json({
            status: 201, success: true,
            message: "کاربر بروزرسانی شد",
        });
    }
    catch (error) {
        next({ error, status: 400 });
    }
});
exports.CreateLink = CreateLink;
const reqOTPUserBylink = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _g;
    try {
        const rememberMe = (_g = req === null || req === void 0 ? void 0 : req.cookies) === null || _g === void 0 ? void 0 : _g.rememberMe;
        if (rememberMe)
            throw { message: "شما عضو هستید" };
        let { phoneNumber, invitationLink } = req.body;
        if (!(0, persian_tools_1.phoneNumberValidator)(phoneNumber))
            throw { message: "شماره موبایل وارد شده صحیح نمی باشد." };
        phoneNumber = (0, persian_tools_1.phoneNumberNormalizer)(phoneNumber, "0");
        const linkRegex = /^(ftp|http|https):\/\/[^ "]+$/;
        if (!linkRegex.test(invitationLink))
            throw { message: 'لینک معتبر نیست' };
        const OTP = (0, utils_1.otp_Generator)();
        const options = {
            new: true,
            upsert: true,
        };
        const user = yield userModel_1.UserModel.findOneAndUpdate({ phoneNumber }, { OTP: { value: OTP, expireIn: Date.now() + 120000 }, friendLinkForMe: invitationLink }, options);
        if (!user)
            throw { message: "رمز یکبار مصرف ارسال نشد." };
        const req_OTP = (0, utils_1.createToken)({ phoneNumber, isValid: false }, "2m");
        res.cookie("req_OTP", req_OTP, {
            httpOnly: true,
            sameSite: "strict",
            secure: true,
        });
        res.status(201).json({ message: "رمز یکبار مصرف به شماره موبایل ارسال شد.", user });
    }
    catch (error) {
        next({ error, status: 400 });
    }
});
exports.reqOTPUserBylink = reqOTPUserBylink;
const sendOTPUserBylink = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _h;
    try {
        const req_OTP = (_h = req === null || req === void 0 ? void 0 : req.cookies) === null || _h === void 0 ? void 0 : _h.req_OTP;
        if (!req_OTP)
            throw { message: "شماره موبایل را وارد کنید" };
        const { phoneNumber, isValid } = (0, utils_1.verifyToken)(req_OTP);
        const user = yield userModel_1.UserModel.findOne({ phoneNumber });
        if (!user)
            throw { message: "کاربر با شماره موبایل یافت نشد." };
        if (!isValid) {
            let { OTP } = req.body;
            if (user.OTP && user.OTP.expireIn) {
                if (OTP != user.OTP.value)
                    throw { message: "رمز یکبار مصرف ارسال شده صحیح نمیباشد." };
                if (Date.now() > user.OTP.expireIn)
                    throw { message: "رمز یکبار مصرف منقضی شده است." };
            }
            res.cookie("req_OTP", (0, utils_1.createToken)({ phoneNumber, isValid: true }, "2h"), {
                httpOnly: true,
                sameSite: "strict",
                secure: true,
            });
        }
        if (user.name && user.lastName)
            return (0, exports.logInByLink)(phoneNumber, user, req, res, next);
        return (0, exports.signUp)(phoneNumber, user, req, res, next);
    }
    catch (error) {
        next({ error, status: 400 });
    }
});
exports.sendOTPUserBylink = sendOTPUserBylink;
const logInByLink = (phoneNumber, user, req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const length = user.address.length;
        if (length) {
            (0, setAddress_1.setCookieLocation)(user.address[0], req, res, next);
        }
        const rememberMeToken = (0, utils_1.createToken)({ phoneNumber }, "1y");
        res.cookie("rememberMe", rememberMeToken, {
            httpOnly: true,
            sameSite: "strict",
            secure: true,
        });
        res.clearCookie("req_OTP");
        user.friendLinkForMe = "";
        user.save();
        res.status(200).json({
            status: 200, success: true,
            message: "شما پیش از این در اسنپ‌ فود عضو شده‌اید. دریافت این کد تخفیف فقط برای کاربران جدید امکان‌پذیر است."
        });
    }
    catch (error) {
        next({ error, status: 400 });
    }
});
exports.logInByLink = logInByLink;
