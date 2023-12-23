import { Schema, model } from "mongoose";

const userSchema = new Schema({
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
    email: { type: String }
    // ,
    // rememberMe:{ type: String}
    ,
    role: { type: String, require: true, default: "USER" },
    OTP: {
        value: { type: String },
        expireIn: { type: Number }
    },
    myLinkForFriends:{type:String},
    friendLinkForMe:{type:String},
    discountForLink:{type:Number,default:20000},
    numFriendsRegWithMyLink:{type:Number,default:0}//Number of friends who registered with my link
},
    { timestamps: true });

const UserModel = model("user", userSchema);
UserModel.collection.createIndex({ 'address.geoLocation': '2dsphere' });

export { UserModel } 
