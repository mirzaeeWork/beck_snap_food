import express, { Express, Request, Response, NextFunction } from 'express';
import { phoneNumberValidator, phoneNumberNormalizer } from "@persian-tools/persian-tools";
import { createToken, otp_Generator, verifyToken } from '../moduls/utils';
import { updateUserSchema, userSchema } from '../validation/schema/userSchema';
import { getLatLng, setAddressForUser, setCookieLocation } from '../moduls/setAddress';
import { isValidObjectId } from 'mongoose';
import mongoose from 'mongoose';
import { roleModel } from '../models/roleModel';
import { UserModel } from '../models/userModel';
import otpGenerator from 'otp-generator'



export const reqOTPuser = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const rememberMe = req?.cookies?.rememberMe;
        if (rememberMe) throw { message: "ابتدا از حساب کاربری خود خارج شوید" }
        if(req?.cookies?.location)  res.clearCookie("location");
        let { phoneNumber } = req.body
        if (!phoneNumberValidator(phoneNumber)) throw { message: "شماره موبایل وارد شده صحیح نمی باشد." };
        phoneNumber = phoneNumberNormalizer(phoneNumber, "0")
        const OTP = otp_Generator();
        const options = {
            new: true,
            upsert: true,
        };
        const user = await UserModel.findOneAndUpdate({ phoneNumber },
            { OTP: { value: OTP, expireIn: Date.now() + 120000 } }, options);
        if (!user) throw { message: "رمز یکبار مصرف ارسال نشد." };
        const req_OTP = createToken({ phoneNumber, isValid: false }, "2m");
        res.cookie("req_OTP", req_OTP, {
            httpOnly: true,
            sameSite: "strict",
            secure: true,
        });

        res.status(201).json({ message: "رمز یکبار مصرف به شماره موبایل ارسال شد.", user })
    } catch (error) {
        next({ error, status: 400 })
    }
}

export const sendOTPuser = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const req_OTP = req?.cookies?.req_OTP
        if (!req_OTP) throw { message: "شماره موبایل را وارد کنید" };
        const { phoneNumber, isValid } = verifyToken(req_OTP)
        const user = await UserModel.findOne({ phoneNumber });
        if (!user) throw { message: "کاربر با شماره موبایل یافت نشد." };
        if (!isValid) {
            let { OTP } = req.body;
            if (user.OTP && user.OTP.expireIn) {
                if (OTP != user.OTP.value) throw { message: "رمز یکبار مصرف ارسال شده صحیح نمیباشد." };
                if (Date.now() > user.OTP.expireIn) throw { message: "رمز یکبار مصرف منقضی شده است." };
            }
            res.cookie("req_OTP", createToken({ phoneNumber, isValid: true }, "2h"), {
                httpOnly: true,
                sameSite: "strict",
                secure: true,
            });
        }
        if (user.name && user.lastName) return logIn(phoneNumber, user, req, res, next);
        return signUp(phoneNumber, user, req, res, next)
    } catch (error) {
        next({ error, status: 400 });
    }
};


export const signUp = async (phoneNumber: string, user: any, req: Request, res: Response, next: NextFunction) => {
    try {
        if (user.name && user.lastName) throw { message: "شما ثبت نام کرده اید" }
        let { name, lastName } = req.body
        if (!name || !lastName) throw { message: "نام و نام خانوادگی را وارد نمایید" }
        await userSchema.validate({ name, lastName }, { abortEarly: false })
        const result = await UserModel.updateOne(
            { phoneNumber: phoneNumber },
            { $set: { name: name, lastName: lastName } }
        );
        if (!result.modifiedCount) throw { message: "نام و نام خانوادگی ایجاد نشد" }
        const rememberMeToken = createToken({ phoneNumber }, "1y");
        res.cookie("rememberMe", rememberMeToken, {
            httpOnly: true,
            sameSite: "strict",
            secure: true,
        });
        res.clearCookie("req_OTP");
        res.status(201).json({
            status: 201, success: true,
            message: "ثبت نام با موفقیت انجام شد"
        })
    }
    catch (error) {
        next({ error, status: 400 })

    }
}


export const logIn = async (phoneNumber: string, user: any, req: Request, res: Response, next: NextFunction) => {
    try {
        const length = user.address.length
        if (length) { setCookieLocation(user.address[0], req, res, next) }
        const rememberMeToken = createToken({ phoneNumber }, "1y");
        res.cookie("rememberMe", rememberMeToken, {
            httpOnly: true,
            sameSite: "strict",
            secure: true,
        });
        res.clearCookie("req_OTP");
        res.status(200).json({
            status: 200, success: true,
            message: "شما وارد حساب کاربری خود شدید"
        })
    } catch (error) {
        next({ error, status: 400 })
    }
}

export const createAddress = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { cityName, addressChoose, addressDetails } = req.body
        const error = await setAddressForUser(cityName, addressChoose, addressDetails)
        if (error) throw error
        const result = await getLatLng(cityName, addressChoose)
        if (!result) throw { message: "طول و عرض جغرافیایی نامعتبر است" }
        const { lat, lng } = result;
        const geoLocation = { type: "Point", coordinates: [lat, lng] };
        const filter = { phoneNumber: req.phoneNumber };
        const update = {
            $push: {
                address: {
                    cityName,
                    addressChoose,
                    addressDetails,
                    geoLocation
                },
            },
        };
        const options = { new: true, upsert: true };
        const user = await UserModel.findOneAndUpdate(filter, update, options);
        const length = user?.address.length
        if (length) setCookieLocation(user.address[length - 1], req, res, next)
        res.status(201).json({
            status: 201, success: true,
            message: " آدرس تایید شد و اضافه شد"
        })

    } catch (error) {
        next({ error, status: 400 })
    }
}


export const selectAddress = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { _id } = req.body
        if (!isValidObjectId(_id)) throw { message: "شناسه معتبر نمی باشد" }

        const result = await UserModel.findOne(
            { phoneNumber: req.phoneNumber, "address._id": _id },
            { "address.$": 1 }
        );

        if (!result) throw { message: "آدرس مورد نظر یافت نشد" }
        const newAddress = result.address[0];
        setCookieLocation(newAddress, req, res, next)
        res.status(201).json({
            status: 201, success: true,
            message: " آدرس انتخاب شد", result
        })

    } catch (error) {
        next({ error, status: 400 })
    }
}


export const updateAddress = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const location = req?.cookies?.location;
        if (!location) throw { message: "ابتدا یک آدرس انتخاب کنید" };
        const { _id } = verifyToken(location);
        const { cityName, addressChoose, addressDetails } = req.body;
        const error = await setAddressForUser(cityName, addressChoose, addressDetails)
        if (error) throw error
        const result = await getLatLng(cityName, addressChoose);
        if (!result) throw { message: "طول و عرض جغرافیایی نامعتبر است" };
        const { lat, lng } = result;
        const geoLocation = { type: "Point", coordinates: [lat, lng] };
        const user = await UserModel.findOne({ phoneNumber: req.phoneNumber });
        if (!user) {
            throw { message: "کاربر پیدا نشد" };
        }
        user.address.filter((adr: any) => {
            if (adr._id == _id) {
                adr.cityName = cityName
                adr.addressChoose = addressChoose
                adr.addressDetails = addressDetails
                adr.geoLocation = geoLocation
            }
        });

        user.save();
        setCookieLocation({ _id, cityName, addressChoose, addressDetails, geoLocation }, req, res, next)
        res.status(201).json({
            status: 201,
            success: true,
            message: "آدرس بروزرسانی شد", _id
        });
    } catch (error) {
        next({ error, status: 400 });
    }
};

export const getAddress = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const location = req?.cookies?.location;
        if (!location) throw { message: "ابتدا یک آدرس انتخاب کنید" };
        const { _id, cityName, address, lat, lng } = verifyToken(location);
        const addressDetails={ _id, cityName, address, lat, lng }
        res.status(201).json({
            status: 201,
            success: true,
            message: ":آدرس انتخابی شما برابر است با ",addressDetails
        });
    } catch (error) {
        next({ error, status: 400 });
    }
};


export const deleteAddress = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.body
        if (!isValidObjectId(id)) throw { message: "شناسه معتبر نمی باشد" }
        const location = req?.cookies?.location;
        if (!location) throw { message: "ابتدا یک آدرس انتخاب کنید" };
        const { _id } = verifyToken(location);
        const result = await UserModel.updateOne(
            { phoneNumber: req.phoneNumber },
            {
                $pull: {
                    address: {
                        _id: new mongoose.Types.ObjectId(id),
                    },
                },
            }
        );
        if (!result.modifiedCount) throw { message: "آدرس مورد نظر حذف نشد" }
        const user = await UserModel.findOne({ phoneNumber: req.phoneNumber })
        if (!user) throw { message: "کاربر پیدا نشد" };
        const length = user.address.length
        if (length && id == _id) { setCookieLocation(user.address[0], req, res, next) }
        else if (!length) { res.clearCookie("location"); }
        res.status(201).json({
            status: 201,
            success: true,
            message: "آدرس حذف شد"
        });
    } catch (error) {
        next({ error, status: 400 });
    }
};

export const logout = async (req: Request, res: Response, next: NextFunction) => {
    try {
        res.clearCookie("rememberMe");
        res.clearCookie("location");
        res.status(201).json({
            status: 201, success: true,
            message: "با موفقیت از حساب کاربری خود خارج شدید "
        })
    } catch (error) {
        next({ error, status: 400 });
    }
}

export const updateUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { phoneNumber } = req
        const { name, lastName, email } = req.body
        if (!name || !lastName) throw { message: "نام و نام خانوادگی را وارد نمایید" }
        await updateUserSchema.validate({ name, lastName, email }, { abortEarly: false })

        const result = await UserModel.updateOne(
            { phoneNumber: phoneNumber },
            { $set: { name: name, lastName: lastName, email: email } }
        );
        if (!result.modifiedCount) throw { message: "بروزرسانی صورت نگرفت" }
        res.status(201).json({
            status: 201, success: true,
            message: "کاربر بروزرسانی شد",
        })
    } catch (error) {
        next({ error, status: 400 });
    }
}


export const getProfile = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { phoneNumber } = req
        const user = await UserModel.findOne({ phoneNumber: phoneNumber }, 
            { __v:0,createdAt:0,updatedAt:0})
        if (!user) throw { message: "کاربر پیدا نشد" }
        res.status(200).json({
            status: 200, success: true,
            user
        })

    } catch (error) {
        next({ error, status: 400 });
    }
}

export const getUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
        let { phoneNumber } = req.body
        if (!phoneNumberValidator(phoneNumber)) throw { message: "شماره موبایل وارد شده صحیح نمی باشد." };
        phoneNumber = phoneNumberNormalizer(phoneNumber, "0")
        const user = await UserModel.findOne({ phoneNumber: phoneNumber }, { __v:0,createdAt:0,updatedAt:0})
        if (!user) throw { message: "کاربر پیدا نشد" }
        res.status(200).json({
            status: 200, success: true,
            user
        })

    } catch (error) {
        next({ error, status: 400 });
    }
}

export const getAllUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const users = await UserModel.find({}, { __v:0,createdAt:0,updatedAt:0})
        if (!users) throw { message: "کاربری پیدا نشد" }
        res.status(200).json({
            status: 200, success: true,
            users
        })

    } catch (error) {
        next({ error, status: 400 });
    }
}

export const SetRole = async (req: Request, res: Response, next: NextFunction) => {
    try {
        let { phoneNumber, titleRole } = req.body
        if (!phoneNumberValidator(phoneNumber)) throw { message: "شماره موبایل وارد شده صحیح نمی باشد." };
        phoneNumber = phoneNumberNormalizer(phoneNumber, "0")
        if (!titleRole || titleRole.length < 3) throw { message: 'حداقل 3 کاراکتر برای عنوان نقش وارد کنید' }
        if (titleRole.toUpperCase() == "OWNER") throw { message: "قابل ثبت نیست OWNER نقش" }
        const role = await roleModel.findOne({ title: titleRole.toUpperCase() })
        if (!role) throw { message: "این نقش وجود ندارد" }
        const result = await UserModel.updateOne({ phoneNumber },
            { $set: { role: titleRole.toUpperCase() } })
        if (!result.modifiedCount) throw { message: "بروزرسانی انجام نشد" }
        res.status(200).json({
            status: 200, success: true,
            message: "بروزرسانی با موفقیت انجام شد"
        })

    } catch (error) {
        next({ error, status: 400 });
    }
}

export const SetForAllLinkDiscount = async (req: Request, res: Response, next: NextFunction) => {
    try {
        let {discountForLink } = req.body
        if (!discountForLink || discountForLink < 10000) throw { message: "حداقل تخفیف برای دعوت از دوستان 10 هزار تومان است" }
        const result = await UserModel.updateMany({},
            { $set: { discountForLink: discountForLink} })
        if (!result.modifiedCount) throw { message: "بروزرسانی انجام نشد" }
        res.status(201).json({
            status: 201, success: true,
            message: "بروزرسانی با موفقیت انجام شد"
        })

    } catch (error) {
        next({ error, status: 400 });
    }
}


export const deleteUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
        let { phoneNumber } = req.body
        if (!phoneNumberValidator(phoneNumber)) throw { message: "شماره موبایل وارد شده صحیح نمی باشد." };
        phoneNumber = phoneNumberNormalizer(phoneNumber, "0")
        const user = await UserModel.deleteOne({ phoneNumber: phoneNumber })
        if (!user.deletedCount) throw { message: "کاربر حذف نشد" }
        res.status(201).json({
            status: 201, success: true,
            message: "کاربر حذف شد"
        })

    } catch (error) {
        next({ error, status: 400 });

    }
}

export const CreateLink = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const random=otpGenerator.generate(6)
        const link=req.protocol+"://"+req.get("host")+`/refer?referrer=${random}`
        const result = await UserModel.updateOne(
            { phoneNumber: req.phoneNumber },
            { $set: { myLinkForFriends:link } }
        );
        if (!result.modifiedCount) throw { message: "بروزرسانی صورت نگرفت" }
        res.status(201).json({
            status: 201, success: true,
            message: "کاربر بروزرسانی شد",
        })
    } catch (error) {
        next({ error, status: 400 });
    }
}

export const reqOTPUserBylink = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const rememberMe = req?.cookies?.rememberMe;
        if (rememberMe) throw { message: "شما عضو هستید" }
        let { phoneNumber, invitationLink} = req.body
        if (!phoneNumberValidator(phoneNumber)) throw { message: "شماره موبایل وارد شده صحیح نمی باشد." };
        phoneNumber = phoneNumberNormalizer(phoneNumber, "0")
        const linkRegex = /^(ftp|http|https):\/\/[^ "]+$/;
        if (!linkRegex.test(invitationLink)) throw { message: 'لینک معتبر نیست' };
        const OTP = otp_Generator();
        const options = {
            new: true,
            upsert: true,
        };
        const user = await UserModel.findOneAndUpdate({ phoneNumber },
            { OTP: { value: OTP, expireIn: Date.now() + 120000 },friendLinkForMe:invitationLink }, options);
        if (!user) throw { message: "رمز یکبار مصرف ارسال نشد." };
        const req_OTP = createToken({ phoneNumber, isValid: false }, "2m");
        res.cookie("req_OTP", req_OTP, {
            httpOnly: true,
            sameSite: "strict",
            secure: true,
        });

        res.status(201).json({ message: "رمز یکبار مصرف به شماره موبایل ارسال شد.", user })
    } catch (error) {
        next({ error, status: 400 })
    }
}

export const sendOTPUserBylink = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const req_OTP = req?.cookies?.req_OTP
        if (!req_OTP) throw { message: "شماره موبایل را وارد کنید" };
        const { phoneNumber, isValid } = verifyToken(req_OTP)
        const user = await UserModel.findOne({ phoneNumber });
        if (!user) throw { message: "کاربر با شماره موبایل یافت نشد." };
        if (!isValid) {
            let { OTP } = req.body;
            if (user.OTP && user.OTP.expireIn) {
                if (OTP != user.OTP.value) throw { message: "رمز یکبار مصرف ارسال شده صحیح نمیباشد." };
                if (Date.now() > user.OTP.expireIn) throw { message: "رمز یکبار مصرف منقضی شده است." };
            }
            res.cookie("req_OTP", createToken({ phoneNumber, isValid: true }, "2h"), {
                httpOnly: true,
                sameSite: "strict",
                secure: true,
            });
        }
        if (user.name && user.lastName) return logInByLink(phoneNumber, user, req, res, next);
        return signUp(phoneNumber, user, req, res, next)
    } catch (error) {
        next({ error, status: 400 });
    }
};

export const logInByLink = async (phoneNumber: string, user: any, req: Request, res: Response, next: NextFunction) => {
    try {
        const length = user.address.length
        if (length) { setCookieLocation(user.address[0], req, res, next) }
        const rememberMeToken = createToken({ phoneNumber }, "1y");
        res.cookie("rememberMe", rememberMeToken, {
            httpOnly: true,
            sameSite: "strict",
            secure: true,
        });
        res.clearCookie("req_OTP");
        user.friendLinkForMe=""
        user.save();
        res.status(200).json({
            status: 200, success: true,
            message: "شما پیش از این در اسنپ‌ فود عضو شده‌اید. دریافت این کد تخفیف فقط برای کاربران جدید امکان‌پذیر است."
        })
    } catch (error) {
        next({ error, status: 400 })
    }
}


