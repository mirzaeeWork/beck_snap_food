import { Schema, Types, model, models } from "mongoose";

const walletSchema = new Schema(
    {
        IncreaseCredit:{type:Number, required: true},
        userPhoneNumber:{ type: String, required: true },
    },
    {
        timestamps: true,
    }
);

const walletModel =model("wallet", walletSchema);

export default walletModel ;

