import { Schema, model } from "mongoose";


const roleSchema = new Schema({
    title: { type: String,require: true  },

    permissions: [
        {
            name: { type: String,require: true ,default: "" },
            crud: { type: [String], require: true, default: [] },
        },
    ],
},
    { timestamps: true });

const roleModel = model("role", roleSchema); 
export { roleModel };