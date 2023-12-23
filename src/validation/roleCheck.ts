import express, { Express, Request, Response, NextFunction } from 'express';
import * as dotenv from 'dotenv';
import { checkUserHashed } from '../moduls/utils';
import { roleModel } from '../models/roleModel';
import { UserModel } from '../models/userModel';
dotenv.config();

const checkPermisson = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user = await UserModel.findOne({ phoneNumber: req.phoneNumber });
        if ( user?.role != "OWNER" )
            throw { message: "مجاز نیستید"};
        next();
    } catch (error) {
        res.clearCookie("rememberMe");
        next({ error, status: 400 })
    }
};

const checkRole = (name: string, crud: string) => async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user = await UserModel.findOne({ phoneNumber: req.phoneNumber  });
        if (user?.role == "OWNER") return next();
        const role = await roleModel.findOne({
            title: user?.role,
        });
        let permission = role?.permissions.find(per => per.name == name)
        if (!permission?.crud.includes(crud))
            throw { status: 403, message: "مجاز نیستید" };
        next();
    } catch (error) {
        res.clearCookie("rememberMe");
        res.clearCookie("location");
        next({ error, status: 400 })
    }
};






export { checkPermisson, checkRole }

