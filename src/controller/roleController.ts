import express, { Express, Request, Response, NextFunction } from 'express';
import { roleModel } from "../models/roleModel"
import { checkUserHashed } from "../moduls/utils"
import { RoleSchema } from "../validation/schema/roleSchema"
import { isValidObjectId } from 'mongoose';
import { UserModel } from '../models/userModel';


//***************postman for addOrUpdaterole*/
// { 
//     "title":"admin",
//     "permissions":
//         [
//             {"name":"user","crud":["read","setRole"]},
//             {"name":"product","crud":["read"]},
//             {"name":"shop","crud":["read","update"]},
//             {"name":"mainCategory","crud":["read","create","update","delete"]},
//             {"name":"subCategory","crud":["read","create","update","delete"]}

//         ]
//      }
//***************postman */


const addRole = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { title, permissions } = req.body
        if (!title || !permissions) throw { message: "عنوان نقش و حداقل یک عملیات وارد شود" };
        await RoleSchema.validate({ title, permissions }, { abortEarly: false })
        const result =await roleModel.findOne({title:title.toUpperCase()})
        if(result) throw {message:"عنوان نقش تکراری می باشد"}
        const role = await roleModel.create({ title: title.toUpperCase(), permissions });

        if (!role) throw { message: "نقش ثبت نشد" };

        res.status(201).json({
            status: 201, success: true,
            message: "نقش  با موفقیت ثبت شد"
        })

    } catch (error) {
        next({ error, status: 400 })
    }
}

const UpdateRole = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { _id, title, permissions } = req.body
        if (!title || !permissions) throw { message: "عنوان نقش و حداقل یک عملیات وارد شود" };
        await RoleSchema.validate({ title, permissions }, { abortEarly: false })

        if (!isValidObjectId(_id)) throw { message: "شناسه صحیح نمی باشد" };
        const role =await roleModel.findOne({title:title.toUpperCase()})
        if(role && role._id!=_id) throw {message:"عنوان نقش تکراری می باشد"}

        const result = await roleModel.updateOne({ _id },
            { $set: { title: title.toUpperCase(), permissions } });
        if (!result.modifiedCount) throw { message: "نقش ثبت نشد" };

        res.status(201).json({
            status: 201, success: true,
            message: "نقش  با موفقیت بروزرسانی شد"
        })

    } catch (error) {
        next({ error, status: 400 })
    }
}


const deleteRole = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { _id } = req.body
        if (!isValidObjectId(_id)) throw { message: "شناسه معتبر نمی باشد" }
        const role = await roleModel.deleteOne({ _id });
        if (!role.deletedCount) throw { message: "پیدا نشد role" };
        res.status(201).json({
            status: 201, success: true,
            message: " با موفقیت حذف شد role"
        })
    } catch (error) {
        next({ error, status: 400 })
    }
};

const getAllRole = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const roles = await roleModel.find();
        if (!roles) throw { message: "پیدا نشد role" };
        res.status(200).json({
            status: 200, success: true,
            roles
        })
    } catch (error) {
        next({ error, status: 400 })
    }
};

const getOneRole = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { _id } = req.body
        if (!isValidObjectId(_id)) throw { message: "شناسه معتبر نمی باشد" }
        const role = await roleModel.find({ _id });
        if (!role.length) throw { message: "پیدا نشد role" };
        res.status(200).json({
            status: 200, success: true,
            role
        })
    } catch (error) {
        next({ error, status: 400 })
    }
};



const createOwner = async (req: any, res: Response, next: NextFunction) => {
    try {
        const { passwordOwner } = req.body;
        if (!passwordOwner) throw { message: "لطفا رمز وارد شود" };

        const isValid = await checkUserHashed(passwordOwner, process.env.hashCheckOwner);
        if (!isValid) throw { message: "رمز وارد شده صحیح نمی باشد" };
         const user = await UserModel.findOne({ phoneNumber: req.phoneNumber });
        if (!user
        ) throw { message: "لطفا وارد حساب کاربری خود شوید" }
        user.role = "OWNER"
        user.save();
        res.status(201).json({
            status: 201, success: true,
            message: " با موفقیت انجام شد",
        })

    } catch (error) {
        next({ error, status: 400 })
    }
}

export { addRole, UpdateRole, deleteRole, createOwner, getAllRole, getOneRole }