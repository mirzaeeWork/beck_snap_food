import express, { Express, Request, Response, NextFunction } from 'express';
import MainCategoryModel from '../models/MainCategoryModel';
import mongoose, { isValidObjectId } from 'mongoose';
import SubCategoryModel from '../models/subCategotyModel';
import { handleFileError, sortForShow, verifyToken } from '../moduls/utils';
import { ShopModel } from '../models/ShopModel';


export const addMainCategory = async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (!req.file) throw { message: "تصویر آپلود نشد" }
        const { path } = req.file;
        let url = path.replace(/\\/g, '/');
        url = url.slice(url.indexOf('/uploads'))
        const { name } = req.body

        if (!name || name.length < 4) throw handleFileError("حداقل 4 کاراکتر برای نام وارد کنید", url)
        const mainCategory = await MainCategoryModel.findOne({ name })
        if (mainCategory) throw handleFileError("دسته بندی تکراری می باشد", url)

        const MainCategory = await MainCategoryModel.create({ name, imageUrl: url })
        if (!MainCategory) throw handleFileError("دسته بندی ایجاد نشد", url)
        res.status(201).json({
            status: 201, success: true,
            message: "دسته بندی مورد نظر ایجاد شد",
        })

    } catch (error) {
        next({ error, status: 400 })
    }
}

export const getAllCategory = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { page, per_page } = req.query;
        const pageNumber: number = page ? +page : 1;
        const itemsPerPage: number = per_page ? +per_page : 12;

        const MainCategory = await MainCategoryModel.aggregate([
            {
                $lookup: {
                    from: SubCategoryModel.collection.name,
                    localField: "_id",
                    foreignField: "mainCategoryId",
                    as: "SubCategories"
                }
            },
            {
                $project: {
                    __v: 0,
                    createdAt: 0,
                    updatedAt: 0,
                    "SubCategories.__v": 0,
                    "SubCategories.createdAt": 0,
                    "SubCategories.updatedAt": 0,
                    "SubCategories.mainCategoryId": 0,
                }
            },
            { $skip: (pageNumber - 1) * itemsPerPage },
            { $limit: itemsPerPage }

        ]);
        if (!MainCategory.length) throw { message: "دسته بندی اصلی وجود ندارد" }
        res.status(200).json({
            status: 200, success: true,
            MainCategory
        })
    } catch (error) {
        next({ error, status: 400 })
    }
}

export const getOneCategory = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const location = req?.cookies?.location || req.location;
        if (!location) throw { message: "ابتدا یک آدرس انتخاب کنید" };
        const { lat, lng, cityName } = verifyToken(location);
        const centerCoordinates: [number, number] = [+lat, +lng];
        const { _id } = req.body
        if (!isValidObjectId(_id)) throw { message: "شناسه معتبر نمی باشد" }
        let { page, per_page, sort, filter } = req.query;
        let match: any;
        let sorted: any;
        sorted = await sortForShow(sort, req, next)
        match = await setMatch(filter, cityName, req, next)
        const pageNumber: number = (page && +page > 0) ? +page : 1;
        const itemsPerPage: number = (per_page && +per_page > 0) ? +per_page : 12;
        const MainCategory = await MainCategoryModel.aggregate([
            {
                $match: {
                    _id: new mongoose.Types.ObjectId(_id),
                },
            },
            {
                $lookup: {
                    from: SubCategoryModel.collection.name,
                    localField: "_id",
                    foreignField: "mainCategoryId",
                    as: "SubCategories",
                },
            },
            {
                $lookup: {
                    from: ShopModel.collection.name,
                    let: { mainId: "$_id" },
                    pipeline: [
                        {
                            $geoNear: {
                                near: { type: 'Point', coordinates: centerCoordinates },
                                distanceField: 'distance',
                                maxDistance: 10000,
                                spherical: true,
                            },
                        },
                        {
                            $match: match,
                        },
                        sorted
                    ],
                    as: "Shops",
                },
            },
            {
                $addFields: {
                    Shops: {
                        $map: {
                            input: "$Shops",
                            as: "shop",
                            in: {
                                $mergeObjects: [
                                    "$$shop",
                                    {
                                        shippingCost: { $ceil: { $multiply: ["$$shop.distance", 5] } },
                                    },
                                ],
                            },
                        },
                    },
                },
            },
            {
                $addFields: {
                    Shops: {
                        $slice: ["$Shops", (pageNumber - 1) * itemsPerPage, itemsPerPage],
                    },
                },
            },
            {
                $project: {
                    _id: 1, name: 1, imageUrl: 1,
                    SubCategories: {
                        _id: 1, name: 1, imageUrl: 1,
                    },
                    Shops: {
                        _id: 1, name_Shop: 1, imageUrl: 1, brandImgUrl: 1,
                        shopActive: 1, address: 1, distance: 1, shippingCost: 1, ProductPriceAvg: 1
                    },
                },
            },
        ]);

        if (!MainCategory || !MainCategory.length) {
            throw { message: "دسته بندی مورد نظر یافت نشد" };
        }

        res.status(200).json({
            status: 200, success: true, MainCategory
        })
    } catch (error) {
        next({ error, status: 400 })
    }
}


export const updateCategory = async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (!req.file) throw { message: "تصویر آپلود نشد" }
        const { path } = req.file;
        let url = path.replace(/\\/g, '/');
        url = url.slice(url.indexOf('/uploads'))
        const { _id, name } = req.body
        if (!isValidObjectId(_id)) throw handleFileError("شناسه معتبر نمی باشد", url);

        if (!name || name.length < 4) throw handleFileError("حداقل 4 کاراکتر برای نام وارد کنید", url);

        const MainCategory = await MainCategoryModel.findOne({ name })
        if (MainCategory && MainCategory._id != _id) throw handleFileError("دسته بندی تکراری می باشد", url)


        const mainCategory = await MainCategoryModel.findOne({ _id }, { imageUrl: 1 })
        if (mainCategory) require("fs").unlinkSync(require("path").join(__dirname, "..", "public", mainCategory.imageUrl))

        const result = await MainCategoryModel.updateOne({ _id },
            { $set: { name, imageUrl: url } })

        if (!result.modifiedCount) throw handleFileError("بروزرسانی انجام نشد", url)


        res.status(201).json({
            status: 201, success: true,
            message: " بروزرسانی با موفقیت انجام شد"
        })
    } catch (error) {
        next({ error, status: 400 })
    }
}


export const deleteCategory = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { _id } = req.body;
        if (!isValidObjectId(_id)) throw { message: "شناسه معتبر نمی باشد" }

        const subCategory = await SubCategoryModel.find({ mainCategoryId: _id })
        if (subCategory.length > 0) throw { message: "ابتدا زیر مجموعه های این دسته بندی را حذف کنید" };


        const MainCategory = await MainCategoryModel.findOneAndDelete({ _id });
        if (!MainCategory) throw { message: "دسته بندی مورد نظر پیدا نشد" };
        require("fs").unlinkSync(require("path").join(__dirname, "..", "public", MainCategory.imageUrl))


        res.status(201).json({
            status: 201, success: true,
            message: "دسته بندی مورد نظر حذف شد"
        })
    } catch (error) {
        next({ error, status: 400 })
    }
}


const setMatch = async (filter: any, cityName: string, req: Request, next: NextFunction) => {
    try {
        let match: any;
        if (!filter) {
            match = {
                $expr: { $eq: ["$mainCategoryId", "$$mainId"] },
                shopActive: true,
                "address.cityName": cityName,
            }
        }
        if (filter == "economy_price") {
            match = {
                $expr: { $eq: ["$mainCategoryId", "$$mainId"] },
                shopActive: true,
                "address.cityName": cityName,
                ProductPriceAvg: { $lte: 300000 }
            }
        }
        if (filter == "average_price") {
            match = {
                $expr: { $eq: ["$mainCategoryId", "$$mainId"] },
                shopActive: true,
                "address.cityName": cityName,
                ProductPriceAvg: { $gt: 300000, $lte: 400000 }
            }
        }
        if (filter == "lux_price") {
            match = {
                $expr: { $eq: ["$mainCategoryId", "$$mainId"] },
                shopActive: true,
                "address.cityName": cityName,
                ProductPriceAvg: { $gt: 400000 }
            }
        }
        return match

    } catch (error) {
        next({ error, status: 400 });

    }
}

