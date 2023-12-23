import { Request, Response, NextFunction } from 'express';
import { productSchema, productUpdateValidation, productValidation } from '../validation/schema/productSchema';
import { handleFileError } from '../moduls/utils';
import { isValidObjectId } from 'mongoose';
import { ProductModel } from '../models/productModel';
import { ProductsGroupModel } from '../models/ProductsGroupModel';
import mongoose from 'mongoose';
import { ShopModel } from '../models/ShopModel';

export const addProduct = async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (!req.file) throw { message: "تصویر آپلود نشد" }
        const { path } = req.file;
        let url = path.replace(/\\/g, '/');
        url = url.slice(url.indexOf('/uploads'))
        const { name, description, productsGroupId, priceDescription } = req.body;

        const priceDescriptions = priceDescription?.map((item: string) => JSON.parse(item))
        if (!isValidObjectId(productsGroupId)) throw handleFileError("شناسه معتبر نمی باشد", url)
        if (!name || !description) throw handleFileError("نام و توضیحات وارد شود", url)

        await productValidation(name, description, priceDescriptions, url)

        const prod = await ProductModel.findOne({ name, productsGroupId })
        if (prod) throw handleFileError("این نام تکراری می باشد", url)

        const productGroup = await ProductsGroupModel.findOne({ shopId: req.shopId, _id: productsGroupId })
        if (!productGroup) throw handleFileError("گروه محصولات وجود ندارد", url)

        const product = await ProductModel.create({
            name, description, productsGroupId, shopId: req.shopId
            , priceDescription: priceDescriptions, imageUrl: url
        });
        if (!product) throw handleFileError("محصول ایجاد نشد", url)

        res.status(201).json({
            status: 201, success: true,
            message: "محصول مورد نظر ایجاد شد",
        })

    } catch (error) {
        next({ error, status: 400 })
    }
}

export const updateProduct = async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (!req.file) throw { message: "تصویر آپلود نشد" }
        const { path } = req.file;
        let url = path.replace(/\\/g, '/');
        url = url.slice(url.indexOf('/uploads'))
        const { _id, name, description, productsGroupId, priceDescription, discount, remainderCcount } = req.body;

        const priceDescriptions = priceDescription?.map((item: string) => JSON.parse(item))
        if (!isValidObjectId(_id)) throw handleFileError("شناسه معتبر نمی باشد", url)
        if (!isValidObjectId(productsGroupId)) throw handleFileError("شناسه معتبر نمی باشد", url)
        if (!name || !description) throw handleFileError("نام و توضیحات وارد شود", url)

        await productUpdateValidation(name, description, priceDescriptions, url, discount, remainderCcount)

        const prod = await ProductModel.findOne({ name, productsGroupId })
        if (prod && prod._id != _id && prod.productsGroupId == productsGroupId) throw handleFileError("این نام تکراری می باشد", url)

        const result = await ProductModel.updateOne({ _id }, {
            $set: {
                name, description, productsGroupId
                , priceDescription: priceDescriptions, discount, remainderCcount, imageUrl: url, isActive: false
            }
        });
        if (!result.modifiedCount) throw { message: "محصول بروزرسانی نشد" }
        res.status(201).json({
            status: 201, success: true,
            message: "محصول مورد نظر  با موفقیت بروزرسانی شد",
        })

    } catch (error) {
        next({ error, status: 400 })
    }
}

export const setavailableProduct = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { _id, isAvailable } = req.body;
        if (!isValidObjectId(_id)) throw { message: "شناسه معتبر نمی باشد" }
        if (typeof (isAvailable) != 'boolean')
            throw { message: "مقدار بایستی از نوع بولین باشد" };
        const result = await ProductModel.updateOne({ _id }, { $set: { isAvailable: isAvailable } });

        if (!result.modifiedCount) throw { message: "محصول بروزرسانی نشد" }
        res.status(201).json({
            status: 201, success: true,
            message: "محصول مورد نظر  ناموجود یا موجود شد",
        })

    } catch (error) {
        next({ error, status: 400 })
    }
}

export const deleteProduct = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { _id } = req.body
        if (!isValidObjectId(_id)) throw { message: "شناسه معتبر نمی باشد" };

        const product = await ProductModel.findOneAndDelete({ _id, shopId: req.shopId })
        if (!product) throw { message: "محصول وجود ندارد" }

        const aggregationResult = await ProductModel.aggregate([
            {
                $match: { shopId:product.shopId, isActive: true }
            },
            {
                $unwind: "$priceDescription"
            },
            {
                $group: {
                    _id: "$shopId",
                    totalPrices: { $sum: "$priceDescription.price" },
                    count: { $sum: 1 }
                }
            },
            {
                $project: {
                    _id: 0,
                    averagePrice:{$ceil:{ $divide: ["$totalPrices", "$count"] }} 
                }
            }
        ]);

        const averagePrice = aggregationResult[0]?.averagePrice || 0;

        // Update the ProductPriceAvg field in the shop document
       const result= await ShopModel.updateOne(
            { _id: product.shopId },
            { $set: { ProductPriceAvg: averagePrice } }
        );
        if (!result.modifiedCount) throw { message: "فروشگاه بروزرسانی نشد"};


        res.status(201).json({
            status: 201, success: true,
            message: " محصول با موفقیت حذف شد"
        })
    } catch (error) {
        next({ error, status: 400 })
    }
}

export const getOneProduct = (count: number) => async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { _id, shopId } = req.body
        if (!isValidObjectId(_id)) throw { message: "شناسه معتبر نمی باشد" };
        let filter: any;
        if (count == 1) {
            filter = {
                _id: new mongoose.Types.ObjectId(_id),
                shopId: new mongoose.Types.ObjectId(req.shopId),
            }
        } else if (count == 2) {
            if (!isValidObjectId(shopId)) throw { message: "شناسه معتبر نمی باشد" };
            filter = {
                _id: new mongoose.Types.ObjectId(_id),
                shopId: new mongoose.Types.ObjectId(shopId),
                isActive: true
            }
        } else if (count == 3) {
            if (!isValidObjectId(shopId)) throw { message: "شناسه معتبر نمی باشد" };
            filter = {
                _id: new mongoose.Types.ObjectId(_id),
                shopId: new mongoose.Types.ObjectId(shopId),
            }
        }

        const product = await ProductModel.findOne(filter)
        if (!product) throw { message: "محصول وجود ندارد" }
        res.status(201).json({
            status: 201, success: true,
            product
        })
    } catch (error) {
        next({ error, status: 400 })
    }
}

export const setproduct = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { _id, isActive } = req.body
        if (!isValidObjectId(_id)) throw { message: "شناسه معتبر نمی باشد" };
        if (typeof (isActive) != 'boolean')
            throw { message: "مقدار بایستی از نوع بولین باشد" };
        const product = await ProductModel.findOneAndUpdate({ _id }, {
            $set: {isActive: isActive }
        })
        if (!product) throw { message: "محصول بروزرسانی نشد" };
        const aggregationResult = await ProductModel.aggregate([
            {
                $match: { shopId:product.shopId, isActive: true }
            },
            {
                $unwind: "$priceDescription"
            },
            {
                $group: {
                    _id: "$shopId",
                    totalPrices: { $sum: "$priceDescription.price" },
                    count: { $sum: 1 }
                }
            },
            {
                $project: {
                    _id: 0,
                    averagePrice:{$ceil:{ $divide: ["$totalPrices", "$count"] }} 
                }
            }
        ]);

        const averagePrice = aggregationResult[0]?.averagePrice || 0;

        // Update the ProductPriceAvg field in the shop document
       const result= await ShopModel.updateOne(
            { _id: product.shopId },
            { $set: { ProductPriceAvg: averagePrice } }
        );
        if (!result.modifiedCount) throw { message: "فروشگاه بروزرسانی نشد"};

        res.status(201).json({
            status: 201, success: true,
            message: "محصول با موفقیت بروزرسانی شد",averagePrice
        })
    } catch (error) {
        next({ error, status: 400 })
    }
}



