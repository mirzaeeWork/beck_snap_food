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
exports.userHashed = exports.checkUserHashed = exports.handleFilesErrorShop = exports.handleFileError = exports.sortForShow = exports.otp_Generator = exports.createToken = exports.verifyToken = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const otp_generator_1 = __importDefault(require("otp-generator"));
const dotenv = __importStar(require("dotenv"));
dotenv.config();
const saltRounds = 8;
const userHashed = (text) => {
    const salt = bcrypt_1.default.genSaltSync(saltRounds);
    const hashed = bcrypt_1.default.hashSync(text, salt);
    if (hashed) {
        return hashed;
    }
    return "";
};
exports.userHashed = userHashed;
const checkUserHashed = (text, textHashed) => __awaiter(void 0, void 0, void 0, function* () {
    const compareHashed = yield bcrypt_1.default.compare(text, textHashed);
    return compareHashed;
});
exports.checkUserHashed = checkUserHashed;
const verifyToken = (token) => {
    if (process.env.SECRET_KEY) {
        return (jsonwebtoken_1.default.verify(token, process.env.SECRET_KEY));
    }
};
exports.verifyToken = verifyToken;
const createToken = (data, exp) => {
    if (process.env.SECRET_KEY) {
        return jsonwebtoken_1.default.sign(data, process.env.SECRET_KEY, { expiresIn: exp });
    }
    else {
        return "";
    }
};
exports.createToken = createToken;
const otp_Generator = () => {
    return otp_generator_1.default.generate(6, {
        upperCaseAlphabets: false,
        specialChars: false,
        lowerCaseAlphabets: false,
    });
};
exports.otp_Generator = otp_Generator;
const handleFileError = (message, url) => {
    require("fs").unlinkSync(require("path").join(__dirname, "..", "public", url));
    return { message };
};
exports.handleFileError = handleFileError;
const handleFilesErrorShop = (message, urls) => {
    urls.map(url => {
        require("fs").unlinkSync(require("path").join(__dirname, "..", "public", url));
    });
    return { message };
};
exports.handleFilesErrorShop = handleFilesErrorShop;
const sortForShow = (sort, req, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let sorted;
        if (!sort)
            sorted = { $sort: { "name_Shop": 1 } };
        if (sort == "recent")
            sorted = { $sort: { "createdAt": -1 } };
        if (sort == "nearest")
            sorted = { $sort: { "distance": 1 } };
        if (sort == "least_expensive")
            sorted = { $sort: { "ProductPriceAvg": 1 } };
        if (sort == "most_expensive")
            sorted = { $sort: { "ProductPriceAvg": -1 } };
        return sorted;
    }
    catch (error) {
        next({ error, status: 400 });
    }
});
exports.sortForShow = sortForShow;
