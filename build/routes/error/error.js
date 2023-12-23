"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = exports.notFound = void 0;
const notFound = (req, res, next) => {
    res.status(404).json({ message: "notfound" });
};
exports.notFound = notFound;
const errorHandler = (error, req, res, next) => {
    var _a, _b;
    const status = error.status || 500;
    const message = ((_a = error === null || error === void 0 ? void 0 : error.error) === null || _a === void 0 ? void 0 : _a.message) || ((_b = error === null || error === void 0 ? void 0 : error.error) === null || _b === void 0 ? void 0 : _b.errors) || (error === null || error === void 0 ? void 0 : error.message) || "internal server error";
    res.status(400).json({ status, message, success: false });
};
exports.errorHandler = errorHandler;
