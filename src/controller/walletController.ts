import express, { Express, Request, Response, NextFunction } from 'express';
import walletModel from '../models/walletModel';
import { phoneNumberNormalizer, phoneNumberValidator } from '@persian-tools/persian-tools';


export const addAndUpdateWallet = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { IncreaseCredit } = req.body;
        if (IncreaseCredit < 1000) throw { message: "افزایش اعتبار بایستی بزرگتر مساوی 1000 تومان باشد" }

        const options = {
            new: true,
            upsert: true,
        };
        const wallet = await walletModel.findOneAndUpdate({ userPhoneNumber: req.phoneNumber },
            { $inc: { IncreaseCredit: IncreaseCredit } }, options);
        if (!wallet) throw { message: "کیف پول ایجاد یا بروزرسانی نشد" };

        res.status(201).json({
            status: 201, success: true,
            message: "افزایش اعتبار انجام شد", wallet
        })

    } catch (error) {
        next({ error, status: 400 })
    }
}

export const getWallet = (count: number) => async (req: Request, res: Response, next: NextFunction) => {
    try {
        let phone: string = "";
        if (count == 1) {
            phone = req.phoneNumber || ""
        } else if (count == 2) {
            const { phoneNumber } = req.body;
            if (!phoneNumberValidator(phoneNumber)) throw { message: "شماره موبایل وارد شده صحیح نمی باشد." };
            phone = phoneNumberNormalizer(phoneNumber, "0")
        }
        const wallet = await walletModel.findOne({ userPhoneNumber: phone },{__v:0,createdAt:0,updatedAt:0});

        res.status(200).json({
            status: 200, success: true,
            wallet
        })

    } catch (error) {
        next({ error, status: 400 })
    }
}

export const deleteWallet = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { phoneNumber } = req.body;
        if (!phoneNumberValidator(phoneNumber)) throw { message: "شماره موبایل وارد شده صحیح نمی باشد." };
        const phone = phoneNumberNormalizer(phoneNumber, "0")
        const result = await walletModel.deleteOne({ userPhoneNumber: phone });
        if (!result.deletedCount) throw { message: "کیف پول حذف نشد" };
        res.status(200).json({
            status: 200, success: true,
            message: "کیف پول کاربر مورد نظر حذف شد"
        })

    } catch (error) {
        next({ error, status: 400 })
    }
}
