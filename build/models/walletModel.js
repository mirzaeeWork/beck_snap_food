"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const walletSchema = new mongoose_1.Schema({
    IncreaseCredit: { type: Number, required: true },
    userPhoneNumber: { type: String, required: true },
}, {
    timestamps: true,
});
const walletModel = (0, mongoose_1.model)("wallet", walletSchema);
exports.default = walletModel;
