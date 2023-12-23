import { Request, Response, NextFunction } from 'express';
import { ProductsGroupModel } from '../models/ProductsGroupModel';
import { checkProductGroup } from '../validation/productsGroupCheck';
import { ShopModel } from '../models/ShopModel';
import mongoose, { isValidObjectId } from 'mongoose';
import { ProductModel } from '../models/productModel';



export const addProductGroup = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { title } = req.body
        if (!title || title.length < 3) throw { message: "عنوان گروه محصولات حداقل شامل 3 کاراکتر باشد" };
        const options = {
            new: true,
            upsert: true,
        };
        console.log(req.shopId)
        const ProductsGroup = await ProductsGroupModel.findOneAndUpdate({ title: title, shopId: req.shopId },
            { $set: { title: title, shopId: req.shopId } }, options);

        if (!ProductsGroup) throw { message: "گروه محصولات ایجاد نشد" };
        res.status(201).json({
            status: 201, success: true,
            message: "گروه محصولات با موفقیت ایجاد شد"
        })

    } catch (error) {
        next({ error, status: 400 })
    }
}


export const updateProductGroup = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { _id, title } = req.body
        if (!isValidObjectId(_id)) throw { message: "شناسه معتبر نمی باشد" };
        if (!title || title.length < 3) throw { message: "عنوان گروه محصولات حداقل شامل 3 کاراکتر باشد" };

        const prodGroup=await ProductsGroupModel.findOne({title})
        if(prodGroup && prodGroup._id !=_id) throw {message:"عنوان گروه تکراری می باشد"}

        const result = await ProductsGroupModel.updateOne({ _id, shopId: req.shopId },
            { $set: { title } })
        if (!result.modifiedCount) throw { message: "گروه محصولات  بروزرسانی نشد" };
        res.status(201).json({
            status: 201, success: true,
            message: "گروه محصولات با موفقیت بروزرسانی شد"
        })

    } catch (error) {
        next({ error, status: 400 })
    }
}


export const getOneProductGroup = (count: number) => async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { _id, shopId } = req.body
        if (!isValidObjectId(_id)) throw { message: "شناسه معتبر نمی باشد" };
        let match: any, match2: any | null;
        if (count == 1) {
            match = {
                _id: new mongoose.Types.ObjectId(_id),
                shopId: new mongoose.Types.ObjectId(req.shopId),
            }
        } else if (count == 2) {
            if (!isValidObjectId(shopId)) throw { message: "شناسه معتبر نمی باشد" };
            match = {
                _id: new mongoose.Types.ObjectId(_id),
                shopId: new mongoose.Types.ObjectId(shopId),
            }
        }
        const productGroup = await ProductsGroupModel.aggregate([
            {
                $match: match,
            },
            {
                $lookup: {
                    from: ProductModel.collection.name,
                    let: { productsGroupId: "$_id" },
                    pipeline: [
                        { $match: { $expr: { $eq: ["$productsGroupId", "$$productsGroupId"] } } },
                    ],
                    as: "Product",
                },
            },

            {
                $project: {
                    __v: 0, updatedAt: 0, createdAt: 0,
                    Products: { __v: 0, updatedAt: 0, createdAt: 0 }
                },
            },
        ]);
        if (!productGroup.length) throw { message: "این فروشگاه این گروه محصولات را ندارد" }
        res.status(201).json({
            status: 201, success: true,
            productGroup
        })
    } catch (error) {
        next({ error, status: 400 })
    }
}

export const getOneProductGroupTrue = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { _id, shopId } = req.body
        if (!isValidObjectId(_id)) throw { message: "شناسه معتبر نمی باشد" };
        if (!isValidObjectId(shopId)) throw { message: "شناسه معتبر نمی باشد" };
        const productGroup = await ProductsGroupModel.aggregate([
            {
                $match: {
                    _id: new mongoose.Types.ObjectId(_id),
                    shopId: new mongoose.Types.ObjectId(shopId),
                },
            },
            {
                $lookup: {
                    from: ProductModel.collection.name,
                    let: { productsGroupId: "$_id" },
                    pipeline: [
                        { $match: { $expr: { $eq: ["$productsGroupId", "$$productsGroupId"] } } },
                        { $match: { isActive: true } }
                    ],
                    as: "Product",
                },
            },

            {
                $project: {
                    __v: 0, updatedAt: 0, createdAt: 0,
                    Products: { __v: 0, updatedAt: 0, createdAt: 0 }
                },
            },
        ]);
        if (!productGroup.length) throw { message: "این فروشگاه این گروه محصولات را ندارد" }
        res.status(201).json({
            status: 201, success: true,
            productGroup
        })
    } catch (error) {
        next({ error, status: 400 })
    }
}

export const setproductsGroup = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { _id, shopId, startTime, endTime } = req.body
        if (!isValidObjectId(_id)) throw { message: "شناسه معتبر نمی باشد" };
        if (!isValidObjectId(shopId)) throw { message: "شناسه معتبر نمی باشد" };
        const productGroup = await ProductsGroupModel.findOne({ _id })
        if (!productGroup) throw { message: " گروه محصولات وجود ندارد" }
        if (startTime && (startTime < Date.now())) throw { message: " زمان شروع بایستی بیشتر از زمان حال باشد" };
        if (endTime && endTime > startTime + 24 * 60 * 60 * 1000) throw { message: "زمان پایان بایستی کمتر از یک روز باشد" };
        const result = await ProductsGroupModel.updateOne({ _id, shopId }, {
            $set: { startTime, endTime }
        })
        if (!result.modifiedCount) throw { message: "گروه محصولات بروزرسانی نشد" };
        res.status(201).json({
            status: 201, success: true,
            message: "گروه محصولات با موفقیت بروزرسانی شد"
        })
    } catch (error) {
        next({ error, status: 400 })
    }
}

export const deleteProductGroup = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { _id } = req.body
        if (!isValidObjectId(_id)) throw { message: "شناسه معتبر نمی باشد" };
        const produc = await ProductModel.findOne({ productsGroupId: _id })
        if (produc) throw { message: "ابتدا محصولات این گروه را حذف کنید" };

        const productGroup = await ProductsGroupModel.findOneAndDelete({ _id, shopId: req.shopId })
        if (!productGroup) throw { message: " گروه محصولات وجود ندارد" }

        res.status(201).json({
            status: 201, success: true,
            message: "گروه محصولات با موفقیت حذف شد",produc
        })
    } catch (error) {
        next({ error, status: 400 })
    }
}

