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
Object.defineProperty(exports, "__esModule", { value: true });
exports.citySchema = void 0;
const yup = __importStar(require("yup"));
const citySchema = yup.object().shape({
    code: yup.string().min(3, "حداقل 3 کاراکتر وارد کنید").required("لطفا کد وارد کنید"),
    title: yup.string().min(2, "حداقل 2 کاراکتر وارد کنید").required("لطفا عنوان وارد کنید"),
    lat: yup.string().min(2, "حداقل 2 کاراکتر وارد کنید").required("لطفا عرض جغرافیایی وارد کنید"),
    lng: yup.string().min(2, "حداقل 2 کاراکتر وارد کنید").required("لطفا طول جغرافیایی وارد کنید"),
});
exports.citySchema = citySchema;
