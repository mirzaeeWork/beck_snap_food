import express, { Express, Request, Response, NextFunction } from 'express';
import CityModel from '../models/cityModel';
import { citySchema } from '../validation/schema/citySchema';
import { verifyToken } from '../moduls/utils';
import { isValidObjectId } from 'mongoose';


const addCity = async (req: Request, res: Response, next: NextFunction) => {
    try {
        //example for json file in postman
        // {
        //     "code": "Tehran",
        //     "title": "تهران",
        //     "lat":"35.715298",
        //     "lng":"51.404343"
        // }
        const { code, title, lat, lng } = req.body;
        await citySchema.validate(req.body, { abortEarly: false })
        const city = await CityModel.findOne({ $or: [{ code }, { title }] });
        if (city) throw { message: "کد یا عنوان شهر تکراری می باشد" }

        const count = await CityModel.countDocuments({});
        const result = await CityModel.create({
            id: (count + 1), code, title, lat, lng
        })
        res.status(201).json({
            status: 201, success: true,
            message: " با موفقیت انجام شد"
            , result
        })

    } catch (error) {
        next({ error, status: 400 })
    }
}

const getCity = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const result = await CityModel.find({}, {  __v: 0, createdAt: 0 });
        res.status(201).json({
            status: 201, success: true,
            message: " با موفقیت انجام شد"
            , result
        })
    } catch (error) {
        next({ error, status: 400 })
    }
}

const updateCity = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { _id, code, title, lat, lng } = req.body;
        if(!isValidObjectId(_id)) throw{message:"شناسه معتبر نمی باشد"}
        await citySchema.validate(req.body, { abortEarly: false })
        const city=await CityModel.findOne({$or: [{ code }, { title }]})
        if(city && (city._id != _id)) throw {message:"کد یا عنوان شهر تکراری می باشد"}
        const find = await CityModel.findOneAndUpdate({ _id },{$set:{code:code, title, lat, lng} } )
        if (!find)
            throw { message: "بروزرسانی انجام نشد" };
        res.status(201).json({
            status: 201, success: true,
            message: " بروزرسانی با موفقیت انجام شد"
        })
    } catch (error) {
        next({ error, status: 400 })
    }
}


const deleteCity = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { _id } = req.body;
        if(!isValidObjectId(_id)) throw{message:"شناسه معتبر نمی باشد"}
        const city = await CityModel.deleteOne({ _id: _id });
        if (!city.deletedCount) throw { message: "شهر حذف نشد " };
        res.status(201).json({
            status: 201, success: true,
            message: " شهر حذف شد"
        })
    } catch (error) {
        next({ error, status: 400 })
    }
}




export { addCity, getCity, updateCity, deleteCity }
