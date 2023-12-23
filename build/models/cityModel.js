"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const citySchema = new mongoose_1.Schema({
    id: {
        type: Number,
        default: 1,
    },
    code: {
        type: String,
    },
    title: {
        type: String,
    },
    lat: {
        type: String,
    },
    lng: {
        type: String,
    },
    createdAt: {
        type: Date,
        default: () => Date.now(),
        immutable: true,
    },
});
const CityModel = mongoose_1.models.cities || (0, mongoose_1.model)("cities", citySchema);
exports.default = CityModel;
