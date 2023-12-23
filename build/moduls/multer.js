"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.upload = void 0;
const multer_1 = __importDefault(require("multer"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const storage = multer_1.default.diskStorage({
    destination: function (req, file, cb) {
        const accessFormat = ["png", "jpeg", "jpg", "webp"];
        if (!accessFormat.includes(file.mimetype.split("/")[1])) {
            return cb(new Error("این فرمت پشتیبانی نمی شود"), new Boolean(false).toString());
        }
        const year = new Date().getFullYear();
        const month = new Date().getMonth() + 1;
        const day = new Date().getDate();
        const test = path_1.default.join(__dirname, "..", "public", "uploads", "image", String(year), String(month), String(day));
        fs_1.default.mkdirSync(test, { recursive: true });
        cb(null, test);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + '.' + file.mimetype.split("/")[1]);
    }
});
const upload = (0, multer_1.default)({ storage: storage, limits: { fileSize: 400 * 1024 }, });
exports.upload = upload;
