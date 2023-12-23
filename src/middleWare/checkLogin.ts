import { Request, Response, NextFunction } from 'express';
import { createToken, verifyToken } from '../moduls/utils';
import * as dotenv from 'dotenv';
import { ShopModel } from '../models/ShopModel';
import { UserModel } from '../models/userModel';
dotenv.config();


declare module 'express' {
    interface Request {
        phoneNumber?: string;
        name_Shop?: string;
        phoneNumber_shop?: string;
        shopId?:string ;
        friendLinkForMe?:string | null;
        discountForLink?:number;
        myLinkForFriends?:string | null;
    }
}

export const checkLogin = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const rememberMeToken = req?.cookies?.rememberMe;
        if (!rememberMeToken) throw { message: "لطفا وارد حساب کاربری خود شوید" }
        const { phoneNumber } = verifyToken(rememberMeToken)   
        const user = await UserModel.findOne({ phoneNumber })
        if (!user
            //  || rememberMeToken != user.rememberMe
        ) throw { message: "لطفا وارد حساب کاربری خود شوید" }
        req.phoneNumber = user.phoneNumber
        req.friendLinkForMe=user.friendLinkForMe
        req.discountForLink=user.discountForLink
        req.myLinkForFriends=user.myLinkForFriends
        next();
    } catch (error: any) {
        error.message = "لطفا وارد حساب کاربری خود شوید"
        res.clearCookie("rememberMe");
        res.clearCookie("location");        
        next({ error, status: 400 })
    }
}



export const checkAndRenewCookie = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const rememberMeToken = req?.cookies?.rememberMe;
        if (!rememberMeToken) { next() }
        else {
            const { phoneNumber, exp } = verifyToken(rememberMeToken)
            const oneMonthInMilliseconds = 6 * 30 * 24 * 60 * 60 * 1000;
            if (exp * 1000 - Date.now() > oneMonthInMilliseconds) {
                const locationToken = req?.cookies?.location;
                if (locationToken) {
                    const { _id, cityName, address, lat, lng } = verifyToken(locationToken)
                    const location = createToken({ _id, cityName, address, lat, lng }, "1y")
                    res.cookie("location", location, {
                        httpOnly: true,
                        sameSite: "strict",
                        secure: true,
                    });
                }
                const rememberMe = createToken({ phoneNumber }, "1y");
                res.cookie("rememberMe", rememberMe, {
                    httpOnly: true,
                    sameSite: "strict",
                    secure: true,
                });

            }
            next()
        }

    } catch (error) {
        next({ error, status: 400 })
    }
};


export const checkLoginShop = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const shopToken = req?.cookies?.shop;
        if (!shopToken) throw { message: "لطفا وارد حساب کاربری فروشگاهی خود شوید"  }
        const { name_Shop, phoneNumber } = verifyToken(shopToken)
        const shop = await ShopModel.findOne({ name_Shop, phoneNumber })
        if (!shop ) throw { message: "لطفا وارد حساب کاربری فروشگاهی خود شوید" }
        req.phoneNumber_shop = phoneNumber
        req.name_Shop=name_Shop
        req.shopId=shop._id.toString();
        next();
    } catch (error: any) {
        error.message = "لطفا وارد حساب کاربری فروشگاهی خود شوید" 
        res.clearCookie("shop");
        next({ error, status: 400 })
    }
}
