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
exports.productUpdateValidation = exports.productValidation = exports.productSchema = void 0;
const yup = __importStar(require("yup"));
exports.productSchema = yup.object().shape({
    name: yup.string().min(3, "حداقل 3 کاراکتر برای نام وارد کنید"),
    description: yup.string().min(3, "حداقل 3 کاراکتر برای توضیحات وارد کنید"),
    priceDescriptions: yup.array().of(yup.object().shape({
        name: yup.string().min(3, 'حداقل 3 کاراکتر برای نام قیمت وارد کنید'),
        price: yup.number().min(1, 'قیمت  باید بزرگتر از صفر باشد').required('قیمت وارد شود')
    })).required('حداقل یک قیمت وارد شود'),
    discount: yup.number().min(5, 'تخفیف  باید بزرگتر از 5 درصد باشد').max(100, 'تخفیف نمی‌تواند بیشتر از 100 درصد باشد'),
    remainderCcount: yup.number().min(1, 'تعداد محصول باید بیشتر از 1 باشد')
});
const productValidation = (name, description, priceDescriptions, url) => __awaiter(void 0, void 0, void 0, function* () {
    if (!(yield exports.productSchema.validate({ name, description, priceDescriptions }, { abortEarly: false }))) {
        require("fs").unlinkSync(require("path").join(__dirname, "..", "..", "public", url));
        yield exports.productSchema.validate({ name, description, priceDescriptions }, { abortEarly: false });
    }
});
exports.productValidation = productValidation;
const productUpdateValidation = (name, description, priceDescriptions, url, discount, remainderCcount) => __awaiter(void 0, void 0, void 0, function* () {
    if (!(yield exports.productSchema.validate({ name, description, priceDescriptions, discount, remainderCcount }, { abortEarly: false }))) {
        require("fs").unlinkSync(require("path").join(__dirname, "..", "..", "public", url));
        yield exports.productSchema.validate({ name, description, priceDescriptions, discount, remainderCcount }, { abortEarly: false });
    }
});
exports.productUpdateValidation = productUpdateValidation;
