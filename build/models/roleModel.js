"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.roleModel = void 0;
const mongoose_1 = require("mongoose");
const roleSchema = new mongoose_1.Schema({
    title: { type: String, require: true },
    permissions: [
        {
            name: { type: String, require: true, default: "" },
            crud: { type: [String], require: true, default: [] },
        },
    ],
}, { timestamps: true });
const roleModel = (0, mongoose_1.model)("role", roleSchema);
exports.roleModel = roleModel;
