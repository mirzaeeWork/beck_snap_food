import { Request, Response, NextFunction } from 'express';
import MainCategoryModel from '../models/MainCategoryModel';

export const checkEntrances = async (req: Request, res: Response, next: NextFunction) => {
    try {
        console.log(req.body)
        const { name } = req.body

        if (!name || name.length < 4) throw { message: "حداقل 4 کاراکتر برای نام وارد کنید" }
        const mainCategory = await MainCategoryModel.findOne({ name })
        if (mainCategory) throw { message: "دسته بندی تکراری می باشد" }
        next();
    } catch (error) {
        next({ error, status: 400 });
    }
};

