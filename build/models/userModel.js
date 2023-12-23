"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserModel = void 0;
const mongoose_1 = require("mongoose");
const userSchema = new mongoose_1.Schema({
    phoneNumber: { type: String, required: true },
    name: {
        type: String
    },
    lastName: {
        type: String
    },
    address: [
        {
            cityName: { type: String, require: true },
            addressChoose: { type: String, require: true },
            addressDetails: { type: String, require: true },
            geoLocation: {
                type: {
                    type: String,
                    default: "Point"
                },
                coordinates: {
                    type: [Number],
                    required: true,
                },
            },
        },
    ],
    email: { type: String },
    role: { type: String, require: true, default: "USER" },
    OTP: {
        value: { type: String },
        expireIn: { type: Number }
    },
    myLinkForFriends: { type: String },
    friendLinkForMe: { type: String },
    discountForLink: { type: Number, default: 20000 },
    numFriendsRegWithMyLink: { type: Number, default: 0 }
}, { timestamps: true });
const UserModel = (0, mongoose_1.model)("user", userSchema);
exports.UserModel = UserModel;
UserModel.collection.createIndex({ 'address.geoLocation': '2dsphere' });
