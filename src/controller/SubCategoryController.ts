import express, { Express, Request, Response, NextFunction } from 'express';
import MainCategoryModel from '../models/MainCategoryModel';
import { isValidObjectId } from 'mongoose';
import SubCategoryModel from '../models/subCategotyModel';
import mongoose from 'mongoose';
import { handleFileError, sortForShow, verifyToken } from '../moduls/utils';
import { ShopModel } from '../models/ShopModel';
import { showAdresses } from '../moduls/setAddress';


export const addSubCategory = async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (!req.file) throw { message: "تصویر آپلود نشد" }
        const { path } = req.file;
        let url = path.replace(/\\/g, '/');
        url = url.slice(url.indexOf('/uploads'))
        const { name, mainCategoryId } = req.body
        if (!name || name.length < 3) throw handleFileError("حداقل 3 کاراکتر برای نام وارد کنید", url);
        if (!isValidObjectId(mainCategoryId)) throw handleFileError("شناسه معتبر نمی باشد", url);

        const result = await MainCategoryModel.findOne({ _id: mainCategoryId })
        if (!result) throw handleFileError(" دسته بندی مورد نظر وجود ندارد ", url)

        const subCategory = await SubCategoryModel.findOne({ name, mainCategoryId })
        if (subCategory ) throw handleFileError("زیر مجموعه برای این دسته بندی تکراری می باشد", url)


        const SubCategory = await SubCategoryModel.create({ name, imageUrl: url, mainCategoryId })
        if (!SubCategory) throw handleFileError("زیر مجموعه ایجاد نشد", url)

        res.status(201).json({
            status: 201, success: true,
            message: "زیر مجموعه مورد نظر ایجاد شد",
        })

    } catch (error) {
        next({ error, status: 400 })
    }
}


export const getOneSubSubCategory = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const location = req?.cookies?.location || req.location;
        if (!location) throw { message: "ابتدا یک آدرس انتخاب کنید" };
        const { lat, lng, cityName } = verifyToken(location);
        const centerCoordinates: [number, number] = [+lat, +lng];
        const { _id } = req.body
        if (!isValidObjectId(_id)) throw { message: "شناسه معتبر نمی باشد" }
        const { page, per_page, sort,filter } = req.query;
        let match: any;
        let sorted:any;
        sorted=await sortForShow(sort,req,next)
        match = await setMatch_Sub_SubCategory(filter, cityName,_id, req, next)

        const pageNumber: number = (page && +page > 0) ? +page : 1;
        const itemsPerPage: number = (per_page && +per_page > 0) ? +per_page : 12;

        const SubCategory = await SubCategoryModel.aggregate([
            {
                $match: {
                    "sub_subCategory._id": new mongoose.Types.ObjectId(_id)
                },
            },
            {
                $lookup: {
                    from: MainCategoryModel.collection.name,
                    localField: "mainCategoryId",
                    foreignField: "_id",
                    as: "mainCategory",
                },
            },
            {
                $lookup: {
                    from: ShopModel.collection.name,
                    let: { subId: "$_id" },
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
                                    {  //The shipping cost per kilometer is multiplied by 5 and the amount obtained is in Toman
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
                        $slice: ["$Shops", (pageNumber - 1) * itemsPerPage, itemsPerPage]
                    }
                },
            },
            {
                $project: {
                    _id: 1,
                    name: 1,
                    imageUrl: 1,
                    sub_subCategory: 1,
                    mainCategory: {
                        _id: 1,
                        name: 1,
                    },
                    Shops: {
                        _id: 1,
                        name_Shop: 1,
                        imageUrl: 1,
                        brandImgUrl: 1,
                        shopActive: 1,
                        address: 1,
                        subCategoriesIds: 1,
                        sub_subCategoriesIds: 1,distance: 1, shippingCost: 1,ProductPriceAvg:1
                    },
                },
            }
        ]);

        res.status(200).json({
            status: 200, success: true,
            SubCategory,
        })
    } catch (error) {
        next({ error, status: 400 })
    }
}

export const getOneSubCategory = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const location = req?.cookies?.location || req.location;
        if (!location) throw { message: "ابتدا یک آدرس انتخاب کنید" };
        const { lat, lng, cityName } = verifyToken(location);
        const centerCoordinates: [number, number] = [+lat, +lng];
        const { _id } = req.body
        if (!isValidObjectId(_id)) throw { message: "شناسه معتبر نمی باشد" }
        const { page, per_page, sort,filter } = req.query;
        let match: any;
        let sorted:any;
        sorted=await sortForShow(sort,req,next)
        match = await setMatch(filter, cityName, req, next)
        const pageNumber: number = (page && +page > 0) ? +page : 1;
        const itemsPerPage: number = (per_page && +per_page > 0) ? +per_page : 12;

        const SubCategory = await SubCategoryModel.aggregate([
            {
                $match: {
                    _id: new mongoose.Types.ObjectId(_id),
                },
            },
            {
                $lookup: {
                    from: MainCategoryModel.collection.name,
                    localField: "mainCategoryId",
                    foreignField: "_id",
                    as: "mainCategory",
                },
            },
            {
                $lookup: {
                    from: ShopModel.collection.name,
                    let: { subId: "$_id" },
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
                                    {  //The shipping cost per kilometer is multiplied by 5 and the amount obtained is in Toman
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
                        $slice: ["$Shops", (pageNumber - 1) * itemsPerPage, itemsPerPage]
                    }
                },
            },
            {
                $project: {
                    _id: 1,
                    name: 1,
                    imageUrl: 1,
                    sub_subCategory: 1,
                    mainCategory: {
                        _id: 1,
                        name: 1,
                    },
                    Shops: {
                        _id: 1,
                        name_Shop: 1,
                        imageUrl: 1,
                        brandImgUrl: 1,
                        shopActive: 1,
                        address: 1,
                        subCategoriesIds: 1,
                        sub_subCategoriesIds: 1,distance: 1, shippingCost: 1,ProductPriceAvg:1
                    },
                },
            }
        ]);

        if (!SubCategory.length) throw { message: "دسته بندی مورد نظر یافت نشد" }
        res.status(200).json({
            status: 200, success: true,
            SubCategory
        })
    } catch (error) {
        next({ error, status: 400 })
    }
}

export const updateSubCategory = async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (!req.file) throw { message: "تصویر آپلود نشد" }
        const { path } = req.file;
        let url = path.replace(/\\/g, '/');
        url = url.slice(url.indexOf('/uploads'))
        const { _id, name, mainCategoryId } = req.body
        if (!isValidObjectId(_id)) throw handleFileError("شناسه معتبر نمی باشد", url);
        if (!isValidObjectId(mainCategoryId)) throw handleFileError("شناسه معتبر نمی باشد", url);
        if (!name || name.length < 3) throw handleFileError("حداقل 3 کاراکتر برای نام وارد کنید", url);

        const response = await MainCategoryModel.findOne({ _id: mainCategoryId })
        if (!response) throw handleFileError(" دسته بندی مورد نظر وجود ندارد ", url)

        const subCategory = await SubCategoryModel.findOne({ name, mainCategoryId })
        if (subCategory && subCategory._id != _id) throw handleFileError("زیر مجموعه برای این دسته بندی تکراری می باشد", url)


        const SubCategory = await SubCategoryModel.findOne({ _id }, { imageUrl: 1 })

        const result = await SubCategoryModel.updateOne({ _id },
            { $set: { name, imageUrl: url, mainCategoryId } })

        if (!result.modifiedCount) throw handleFileError("بروزرسانی انجام نشد", url)

        if (SubCategory) require("fs").unlinkSync(require("path").join(__dirname, "..", "public", SubCategory.imageUrl))


        res.status(201).json({
            status: 201, success: true,
            message: " بروزرسانی با موفقیت انجام شد"
        })
    } catch (error) {
        next({ error, status: 400 })
    }
}


export const deleteSubCategory = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { _id } = req.body;
        if (!isValidObjectId(_id)) throw { message: "شناسه معتبر نمی باشد" }
        const subCategory = await SubCategoryModel.findOne({ _id })
        if (subCategory && subCategory.sub_subCategory.length > 0) throw { message: "ابتدا بایستی مجموعه های ثانویه این زیر مجموعه حذف شوند" };

        if (await ShopModel.findOne({ subCategoriesIds: _id })) {
            const shops = await ShopModel.updateMany({ subCategoriesIds: _id },
                { $pull: { subCategoriesIds: _id }, $set: { shopActive: false } })
            if (!shops.modifiedCount) throw { message: "فروشگاه های این زیر مجموعه غیرفعال نشد" };
        }


        const SubCategory = await SubCategoryModel.findOneAndDelete({ _id });
        if (!SubCategory) throw { message: "زیر مجموعه مورد نظر یافت نشد" };
        require("fs").unlinkSync(require("path").join(__dirname, "..", "public", SubCategory.imageUrl))

        res.status(201).json({
            status: 201, success: true,
            message: "زیر مجموعه مورد نظر حذف شد"
        })
    } catch (error) {
        next({ error, status: 400 })
    }
}

export const CreateSub_SubCategory = async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (!req.file) throw { message: "تصویر آپلود نشد" }
        const { path } = req.file;
        let url = path.replace(/\\/g, '/');
        url = url.slice(url.indexOf('/uploads'))
        const { subCategoryId, second_name } = req.body
        if (!second_name || second_name.length < 3) throw handleFileError("حداقل 3 کاراکتر برای نام وارد کنید", url);
        if (!isValidObjectId(subCategoryId)) throw handleFileError("زیر مجموعه مورد نظر یافت نشد", url);

        const subCategory = await SubCategoryModel.findOne({ _id:subCategoryId, 'sub_subCategory.second_name': second_name })
        if (subCategory) throw handleFileError(" مجموعه ثانویه در این زیر مجموعه وجود دارد", url)


        const update = {
            $push: {
                sub_subCategory: {
                    second_name,
                    second_imageUrl: url,
                },
            },
        };

        const SubCategory = await SubCategoryModel.findOneAndUpdate({ _id:subCategoryId }, update)
        if (!SubCategory) throw handleFileError(" مجموعه ثانویه ایجاد نشد", url)

        res.status(201).json({
            status: 201, success: true,
            message: " مجموعه ثانویه مورد نظر ایجاد شد",
        })

    } catch (error) {
        next({ error, status: 400 })
    }
}


export const UpdateSub_SubCategory = async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (!req.file) throw { message: "تصویر آپلود نشد" }
        const { path } = req.file;
        let url = path.replace(/\\/g, '/');
        url = url.slice(url.indexOf('/uploads'))
        const { subCategoryId, sub_subCategoryID, second_name } = req.body
        if (!second_name || second_name.length < 3) throw handleFileError("حداقل 3 کاراکتر برای نام وارد کنید", url);
        if (!isValidObjectId(subCategoryId)) throw handleFileError("زیر مجموعه مورد نظر یافت نشد", url);
        if (!isValidObjectId(sub_subCategoryID)) throw handleFileError(" مجموعه ثانویه مورد نظر یافت نشد", url);
        const Sub_SubCategory = await SubCategoryModel.findOne({ _id:subCategoryId },
            { 'sub_subCategory': { $elemMatch: { second_name } } });
        if (Sub_SubCategory?.sub_subCategory[0] && (Sub_SubCategory.sub_subCategory[0] as any)._id != sub_subCategoryID
            && (Sub_SubCategory.sub_subCategory[0] as any).second_name == second_name) {
            throw handleFileError("نام مجموعه ثانویه برای این زیر مجموعه تکراری می باشد", url)
        }

        const subCategory = await SubCategoryModel.findOne(
            { _id:subCategoryId },
            { 'sub_subCategory': { $elemMatch: { _id: sub_subCategoryID } } }
        );


        const SubCategory = await SubCategoryModel.updateOne(
            { _id:subCategoryId, 'sub_subCategory._id': sub_subCategoryID },
            {
                $set: {
                    'sub_subCategory.$.second_name': second_name,
                    'sub_subCategory.$.second_imageUrl': url
                }
            })
        if (!SubCategory) throw handleFileError(" مجموعه ثانویه بروزرسانی نشد", url)

        if (subCategory?.sub_subCategory[0]) require("fs").unlinkSync(require("path").join(__dirname, "..", "public",
            subCategory.sub_subCategory[0].second_imageUrl))

        res.status(201).json({
            status: 201, success: true,
            message: " مجموعه ثانویه مورد نظر بروزرسانی شد"
        })

    } catch (error) {
        next({ error, status: 400 })
    }
}

export const DeleteSub_SubCategory = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { subCategoryId, sub_subCategoryID } = req.body
        if (!isValidObjectId(subCategoryId)) throw { message: "شناسه معتبر نمی باشد" };
        if (!isValidObjectId(sub_subCategoryID)) throw { message: "شناسه معتبر نمی باشد" };

        if (await ShopModel.findOne({ sub_subCategoriesIds: sub_subCategoryID })) {
            const shops = await ShopModel.updateMany({ sub_subCategoriesIds: sub_subCategoryID },
                { $pull: { sub_subCategoriesIds: sub_subCategoryID }, $set: { shopActive: false } })
            if (!shops.modifiedCount) throw { message: "فروشگاه های مجموعه ثانویه غیرفعال نشد" };
        }

        const subCategory = await SubCategoryModel.findOne(
            { _id:subCategoryId },
            { 'sub_subCategory': { $elemMatch: { _id: sub_subCategoryID } } }
        );


        const SubCategory = await SubCategoryModel.updateOne(
            { _id:subCategoryId },
            { $pull: { sub_subCategory: { _id: sub_subCategoryID } } }
        )
        if (!SubCategory.modifiedCount) throw { message: " مجموعه ثانویه حذف نشد" }

        if (subCategory?.sub_subCategory[0]) require("fs").unlinkSync(require("path").join(__dirname, "..", "public",
            subCategory.sub_subCategory[0].second_imageUrl))

        res.status(201).json({
            status: 201, success: true,
            message: " مجموعه ثانویه مورد نظر حذف شد"
        })

    } catch (error) {
        next({ error, status: 400 })
    }
}
const setMatch = async (filter: any, cityName: string, req: Request, next: NextFunction) => {
    try {
        let match: any;
        if(!filter){
            match = {
                $expr: { $in: ["$$subId", "$subCategoriesIds"] },
                shopActive: true,
                "address.cityName": cityName,
            }
        }
        if(filter=="economy_price"){
            match = {
                $expr: { $in: ["$$subId", "$subCategoriesIds"] },
                shopActive: true,
                "address.cityName": cityName,
                ProductPriceAvg: {  $lte: 300000 }
            }
        }
        if(filter=="average_price"){
            match = {
                $expr: { $in: ["$$subId", "$subCategoriesIds"] },
                shopActive: true,
                "address.cityName": cityName,
                ProductPriceAvg: { $gt: 300000, $lte: 400000 }
            }
        }
        if(filter=="lux_price"){
            match = {
                $expr: { $in: ["$$subId", "$subCategoriesIds"] },
                shopActive: true,
                "address.cityName": cityName,
                ProductPriceAvg: { $gt: 400000}
            }
        }
        return match

    } catch (error) {
        next({ error, status: 400 });

    }
}

const setMatch_Sub_SubCategory = async (filter: any, cityName: string,_id:string , req: Request, next: NextFunction) => {
    try {
        let match: any;
        if(!filter){
            match = {
                $expr: { $in: ["$$subId", "$subCategoriesIds"] },
                shopActive: true, "address.cityName": cityName,
                sub_subCategoriesIds: new mongoose.Types.ObjectId(_id)
            }
        }
        if(filter=="economy_price"){
            match = {
                $expr: { $in: ["$$subId", "$subCategoriesIds"] },
                shopActive: true, "address.cityName": cityName,
                sub_subCategoriesIds: new mongoose.Types.ObjectId(_id),
                ProductPriceAvg: {  $lte: 300000 }
            }
        }
        if(filter=="average_price"){
            match = {
                $expr: { $in: ["$$subId", "$subCategoriesIds"] },
                shopActive: true, "address.cityName": cityName,
                sub_subCategoriesIds: new mongoose.Types.ObjectId(_id),
                ProductPriceAvg: { $gt: 300000, $lte: 400000 }
            }
        }
        if(filter=="lux_price"){
            match = {
                $expr: { $in: ["$$subId", "$subCategoriesIds"] },
                shopActive: true, "address.cityName": cityName,
                sub_subCategoriesIds: new mongoose.Types.ObjectId(_id),
                ProductPriceAvg: { $gt: 400000}
            }
        }
        return match

    } catch (error) {
        next({ error, status: 400 });

    }
}





