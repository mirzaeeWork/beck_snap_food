import { Request, Response, NextFunction } from 'express';
import { getLatLng, setAddressForUser, showAdresses } from '../moduls/setAddress';
import { phoneNumberNormalizer, phoneNumberValidator } from '@persian-tools/persian-tools';
import { createToken, handleFilesErrorShop, otp_Generator, verifyToken } from '../moduls/utils';
import { LengthSub_SubCategoryIds, checkShop } from '../validation/shopCheck';
import { ShopModel } from '../models/ShopModel';
import mongoose, { isValidObjectId } from 'mongoose';
import MainCategoryModel from '../models/MainCategoryModel';
import SubCategoryModel from '../models/subCategotyModel';
import { ProductsGroupModel } from '../models/ProductsGroupModel';
import { ProductModel } from '../models/productModel';
import CityModel from '../models/cityModel';

export const req_otp_shop = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { name_Shop, name_ShopOwner, lastName_ShopOwner, phoneNumber,
            cityName, addressChoose, addressDetails, mainCategoryId, subCategoriesIds, introduceCode
        } = req.body

        const errors = await checkShop(name_Shop, name_ShopOwner, lastName_ShopOwner, phoneNumber,
            mainCategoryId, subCategoriesIds)
        if (errors) throw errors
        const phoneNumbers = phoneNumberNormalizer(phoneNumber, "0")
        const repeat = await ShopModel.findOne({ name_Shop })
        if (repeat) throw { message: "نام مغازه تکراری است" }

        const error = await setAddressForUser(cityName, addressChoose, addressDetails)
        if (error) throw error
        const result = await getLatLng(cityName, addressChoose)
        if (!result) throw { message: "طول و عرض جغرافیایی نامعتبر است" }
        const { lat, lng } = result;
        const geoLocation = { type: "Point", coordinates: [lat, lng] };
        const OTP = otp_Generator();
        const options = {
            new: true,
            upsert: true,
        };
        const shop = await ShopModel.findOneAndUpdate({ phoneNumber: phoneNumbers, name_Shop }, {
            name_Shop, name_ShopOwner, lastName_ShopOwner, phoneNumber: phoneNumbers,
            address: { cityName, addressChoose, addressDetails, geoLocation },
            OTP: { value: OTP, expireIn: Date.now() + 120000 },
            mainCategoryId, subCategoriesIds, introduceCode, shopActive: false
        }, options)

        if (!shop) throw { message: "رمز یکبار مصرف ارسال نشد." };
        const req_OTP = createToken({ name_Shop, phoneNumber: phoneNumbers }, "3m");
        res.cookie("req_OTP_shop", req_OTP, {
            httpOnly: true,
            sameSite: "strict",
            secure: true,
        });

        res.status(201).json({ success: true, message: "رمز یکبار مصرف به شماره موبایل ارسال شد.", shop })

    } catch (error) {
        next({ error, status: 400 })
    }
}

export const sendOTP_shop = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const req_OTP_shop = req?.cookies?.req_OTP_shop
        if (!req_OTP_shop) throw { message: "شماره موبایل را وارد کنید" };
        const { name_Shop, phoneNumber } = verifyToken(req_OTP_shop)
        if (!phoneNumber) {
            res.clearCookie("req_OTP_shop");
            throw { message: "شماره موبایل را وارد کنید" };
        }
        const shop = await ShopModel.findOne({ name_Shop, phoneNumber });
        if (!shop) throw { message: "فروشگاه یافت نشد." };
        let { OTP } = req.body;
        if (shop.OTP && shop.OTP.expireIn) {
            if (OTP != shop.OTP.value) throw { message: "رمز یکبار مصرف ارسال شده صحیح نمیباشد." };
            if (Date.now() > shop.OTP.expireIn) throw { message: "رمز یکبار مصرف منقضی شده است." };
        }
        const shopToken = createToken({ name_Shop, phoneNumber }, "1y");
        res.cookie("shop", shopToken, {
            httpOnly: true,
            sameSite: "strict",
            secure: true,
        });
        res.clearCookie("req_OTP_shop");
        res.status(201).json({
            success: true,
            message: "وارد پنل فروشگاهی شدید"
        })

    } catch (error) {
        next({ error, status: 400 });
    }
};

export const login_shop = async (req: Request, res: Response, next: NextFunction) => {
    try {
        let { name_Shop, phoneNumber } = req.body;
        if (!phoneNumberValidator(phoneNumber)) throw { message: "شماره موبایل وارد شده صحیح نمی باشد." };
        const phoneNumbers = phoneNumberNormalizer(phoneNumber, "0")
        if (!name_Shop || name_Shop.length < 3) throw { message: "حداقل 3 کاراکتر برای نام مغازه وارد کنید" }

        const shop = await ShopModel.findOne({ name_Shop, phoneNumber: phoneNumbers });
        if (!shop) throw { message: "فروشگاه یافت نشد." };
        const OTP = otp_Generator();
        shop.OTP = { value: OTP, expireIn: Date.now() + 120000 }
        shop.save()
        const req_OTP = createToken({ name_Shop, phoneNumber: phoneNumbers }, "3m");
        res.cookie("req_OTP_shop", req_OTP, {
            httpOnly: true,
            sameSite: "strict",
            secure: true,
        });

        res.status(201).json({ success: true, message: "رمز یکبار مصرف به شماره موبایل ارسال شد.", shop })


    } catch (error) {
        next({ error, status: 400 });
    }
};

export const update_first = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { _id, name_Shop, name_ShopOwner, lastName_ShopOwner, phoneNumber,
            cityName, addressChoose, addressDetails, mainCategoryId, subCategoriesIds, introduceCode
        } = req.body
        if (!isValidObjectId(_id)) throw { message: "شناسه معتبر نمی باشد" }
        const errors = await checkShop(name_Shop, name_ShopOwner, lastName_ShopOwner, phoneNumber,
            mainCategoryId, subCategoriesIds)
        if (errors) throw errors
        const phoneNumbers = phoneNumberNormalizer(phoneNumber, "0")
        const repeat = await ShopModel.findOne({ name_Shop })
        if (repeat && repeat._id != _id) throw { message: "نام مغازه تکراری است" }

        const error = await setAddressForUser(cityName, addressChoose, addressDetails)
        if (error) throw error
        const result = await getLatLng(cityName, addressChoose)
        if (!result) throw { message: "طول و عرض جغرافیایی نامعتبر است" }
        const { lat, lng } = result;
        const geoLocation = { type: "Point", coordinates: [lat, lng] };
        const reponse = await ShopModel.updateOne({ _id }, {
            name_Shop, name_ShopOwner, lastName_ShopOwner, phoneNumber: phoneNumbers,
            address: { cityName, addressChoose, addressDetails, geoLocation },
            mainCategoryId, subCategoriesIds, introduceCode, shopActive: false
        },)

        if (!reponse.modifiedCount) throw { message: "بروزرسانی اولیه انجام نشد" };
        const shopToken = createToken({ name_Shop, phoneNumber }, "1y");
        res.cookie("shop", shopToken, {
            httpOnly: true,
            sameSite: "strict",
            secure: true,
        });

        res.status(201).json({ success: true, message: "بروزرسانی اولیه انجام شد" })

    } catch (error) {
        next({ error, status: 400 })
    }
};

export const update_second = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const length = (req.files as Express.Multer.File[])?.length;
        if (!req.files) throw { message: "تصاویر آپلود نشد" }
        const images_shop = (req.files as Express.Multer.File[])?.map((file: Express.Multer.File) => {
            let url = file.path.replace(/\\/g, '/');
            url = url.slice(url.indexOf('/uploads'));
            return (url)
        });
        if (length < 2) throw handleFilesErrorShop("بایستی دو تصویر آپلود شود", images_shop || [])

        const shop = await ShopModel.findOne({ phoneNumber: req.phoneNumber_shop, name_Shop: req.name_Shop })
        const { description, sub_subCategoriesIds,salesTax } = req.body
        if (!description || description.length < 5) throw handleFilesErrorShop("حداقل 5 کاراکتر برای توضیحات وارد شود", images_shop || [])
        if(salesTax && (+salesTax<1 || +salesTax>20)) throw handleFilesErrorShop(" حداکثر مالیات 20% می باشد", images_shop || [])

        if (sub_subCategoriesIds) {
            sub_subCategoriesIds?.map((id: string) => {
                if (!isValidObjectId(id)) throw handleFilesErrorShop("شناسه ها معتبر نمی باشند", images_shop || []);
            })
            const subcategories = await LengthSub_SubCategoryIds(shop, sub_subCategoriesIds)
            if (subcategories.length !== sub_subCategoriesIds.length) {
                throw handleFilesErrorShop("تمام زیر مجموعه های ثانویه بایستی به زیر مجموعه های انتخابی تعلق داشته باشند", images_shop || []);
            }
        }

        const result = await ShopModel.updateOne({ phoneNumber: req.phoneNumber_shop, name_Shop: req.name_Shop },
            {
                imageUrl: images_shop[0],salesTax:+salesTax,
                brandImgUrl: images_shop[1], description, sub_subCategoriesIds, shopActive: false
            })

        if (!result.modifiedCount) throw { message: "بروزرسانی ثانویه انجام نشد" };

        res.status(201).json({
            success: true, message: "بروزرسانی ثانویه انجام شد", images_shop, sub_subCategoriesIds
        })

    } catch (error) {
        next({ error, status: 400 })
    }
};


export const getShopProductTrue = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const location = req?.cookies?.location || req.location;
        if (!location) throw { message: "ابتدا یک آدرس انتخاب کنید" };
        const { lat, lng, cityName } = verifyToken(location);
        const centerCoordinates: [number, number] = [+lat, +lng];
        const { _id } = req.body;
        if (!isValidObjectId(_id)) throw { message: "شناسه معتبر نمی باشد" };
        const shop = await ShopModel.aggregate([
            {
                $geoNear: {
                    near: { type: 'Point', coordinates: centerCoordinates },
                    distanceField: 'distance',
                    // maxDistance: 5000,//metr
                    spherical: true,
                },
            },
            {
                $match: { _id: new mongoose.Types.ObjectId(_id), shopActive: true },
            },
            {
                $addFields: {
                    shippingCost: {
                        //The shipping cost per kilometer is multiplied by 5 and the amount obtained is in Toman
                        $ceil: { $multiply: ['$distance', 5] },
                    },
                },
            },
            {
                $project: {
                    _id: 1,
                    name_Shop: 1,
                    brandImgUrl: 1,
                    imageUrl: 1,
                    shopActive: 1,
                    address: 1,
                    distance: 1,
                    shippingCost: 1,
                },
            },
        ]);

        const productGroup = await ProductsGroupModel.aggregate([
            {
                $match: { shopId: new mongoose.Types.ObjectId(_id) },
            },
            {
                $lookup: {
                    from: ProductModel.collection.name,
                    let: { productsGroupId: "$_id" },
                    pipeline: [
                        { $match: { $expr: { $eq: ["$productsGroupId", "$$productsGroupId"] } } },
                        { $match: { isActive: true } }
                    ],
                    as: "products",
                },
            },
            {
                $project: {
                    createdAt: 0,
                    updatedA: 0,
                    __v: 0,
                    products: {
                        createdAt: 0, updatedA: 0, __v: 0,
                    }
                }
            }
        ])

        if (!shop.length) throw { message: "فروشگاه یافت نشد." };
        let resultAddress = "";
        if (shop[0].distance > 5000) {
            resultAddress = "آدرس مورد نظر در محدوده سرویس دهی فروشگاه نمی باشد",
            shop[0].shippingCost = 0
        }//برای فرانت

        res.status(200).json({
            status: 200, success: true, resultAddress,
            shop,
            productGroup
        })

    } catch (error) {
        next({ error, status: 400 })
    }
}

export const getAllShopFalse = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { cityName } = req.body;
        if(!cityName) throw {message:"لطفا نام شهر را وارد کنید"}
        const city = await CityModel.findOne({ title: cityName });

        if (!city) return { message: "نام شهر مجاز نمی باشد" };

        const shop = await ShopModel.find({ "address.cityName": cityName, shopActive: false });


        res.status(200).json({
            status: 200, success: true,
            shop,
        })

    } catch (error) {
        next({ error, status: 400 })
    }
}

export const getShopProduct = (count: number) => async (req: Request, res: Response, next: NextFunction) => {
    try {
        let match: any;
        if (count == 1) {
            match = { _id: new mongoose.Types.ObjectId(req.shopId) }
        }
        else if (count == 2) {
            let { name_Shop, phoneNumber } = req.body;
            if (!phoneNumberValidator(phoneNumber)) throw { message: "شماره موبایل وارد شده صحیح نمی باشد." };
            const phoneNumbers = phoneNumberNormalizer(phoneNumber, "0")
            if (!name_Shop || name_Shop.length < 3) throw { message: "حداقل 3 کاراکتر برای نام مغازه وارد کنید" }
            match = {
                name_Shop, phoneNumber: phoneNumbers
            }
        } else if (count == 3) {
            const { _id } = req.body
            if (!isValidObjectId(_id)) throw { message: "شناسه معتبر نمی باشد" }
            match = { _id: new mongoose.Types.ObjectId(_id) }
        }
        const shop = await ShopModel.aggregate([
            {
                $match: match,
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
                    from: SubCategoryModel.collection.name,
                    localField: "subCategoriesIds",
                    foreignField: "_id",
                    as: "SubCategories",
                },
            },
            {
                $addFields: {
                    SubCategories: {
                        $map: {
                            input: "$SubCategories",
                            as: "subcategory",
                            in: {
                                _id: "$$subcategory._id",
                                name: "$$subcategory.name",
                                sub_subCategory: {
                                    $filter: {
                                        input: "$$subcategory.sub_subCategory",
                                        as: "item",
                                        cond: {
                                            $in: ["$$item._id", "$sub_subCategoriesIds"]
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            },
            {
                $project: {
                    name_Shop: 1, name_ShopOwner: 1, lastName_ShopOwner: 1, phoneNumber: 1,
                    imageUrl: 1, brandImgUrl: 1, description: 1, shopActive: 1, shopOpen: 1,
                    address: 1,
                    mainCategory: { name: 1 },
                    SubCategories: { _id:1,name: 1, sub_subCategory: { _id:1,second_name: 1 } },
                }
            }
        ]);

        const productGroup = await ProductsGroupModel.aggregate([
            {
                $match: { shopId: new mongoose.Types.ObjectId(shop[0]._id) },
            },
            {
                $lookup: {
                    from: ProductModel.collection.name,
                    localField: "_id",
                    foreignField: "productsGroupId",
                    as: "products",
                },
            },
            {
                $project: {
                    createdAt: 0,
                    updatedA: 0,
                    __v: 0,
                    products: {
                        createdAt: 0, updatedA: 0, __v: 0,
                    }
                }
            }

        ])

        if (!shop.length) throw { message: "فروشگاه یافت نشد." };
        res.status(200).json({
            status: 200, success: true,
            shop, productGroup
        })

    } catch (error) {
        next({ error, status: 400 })
    }
}


export const setActive = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { name_Shop, phoneNumber, shopActive } = req.body
        if (!phoneNumberValidator(phoneNumber)) throw { message: "شماره موبایل وارد شده صحیح نمی باشد." };
        const phoneNumbers = phoneNumberNormalizer(phoneNumber, "0")
        if (!name_Shop || name_Shop.length < 3) throw { message: "حداقل 3 کاراکتر برای نام مغازه وارد کنید" }
        if (typeof (shopActive) != 'boolean') throw { message: "مقدار بایستی از نوع بولین باشد" }
        const result = await ShopModel.updateOne({ name_Shop, phoneNumber: phoneNumbers }, { shopActive })
        if (!result.modifiedCount) throw { message: "بروزرسانی فعالیت انجام نشد" };
        res.status(201).json({
            status: 201, success: true, message: "بروزرسانی فعالیت با موفقیت انجام شد"
        })

    } catch (error) {
        next({ error, status: 400 })
    }
}

export const setOpen = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { shopOpen } = req.body
        if (!(typeof shopOpen == 'boolean')) throw { message: "مقدار بایستی از نوع بولین باشد" }
        const result = await ShopModel.updateOne({ _id: req.shopId }, { shopOpen })
        if (!result.modifiedCount) throw { message: "بروزرسانی باز یا بسته بودن فروشگاه انجام نشد" };
        res.status(201).json({
            status: 201, success: true, message: "بروزرسانی باز یا بسته بودن فروشگاه با موفقیت انجام شد"
        })

    } catch (error) {
        next({ error, status: 400 })
    }
}

export const deleteShop = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { _id } = req.body
        if (!isValidObjectId(_id)) throw { message: "شناسه معتبر نمی باشد" }

        if (await ProductModel.findOne({ shopId: _id })) {
            const products = await ProductModel.deleteMany({ shopId: _id })
            if (!products.deletedCount) throw { message: "محصولات این فروشگاه را حذف نشد" };
        }

        if (await ProductsGroupModel.findOne({ shopId: _id })) {
            const productGroup = await ProductsGroupModel.deleteMany({ shopId: _id })
            if (!productGroup.deletedCount) throw { message: " گروه محصولات این فروشگاه حذف نشد" };
        }

        const result = await ShopModel.deleteOne({ _id })
        if (!result.deletedCount) throw { message: "فروشگاه حذف نشد" };

        res.status(201).json({
            status: 201, success: true, message: "فروشگاه با موفقیت حذف شد"
        })

    } catch (error) {
        next({ error, status: 400 })
    }
}


export const getNameSearch = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const location = req?.cookies?.location;
        let lat, lng, cityName;

        if (location) {
            ({ lat, lng, cityName } = verifyToken(location));
        }

        const { search } = req.body


        if (search.length < 3) {
            res.status(200).json({
                status: 200, success: true
            })
        }

        const mainCategory = await MainCategoryModel.find({ name: { $regex: search } }, { _id: 1, name: 1 })
        const SubCategory = await SubCategoryModel.find({ name: { $regex: search } }, { _id: 1, name: 1 })
        const sub_SubCategory = await SubCategoryModel.find(
            { "sub_subCategory.second_name": { $regex: search } },
            { "sub_subCategory.$": 1 }
        );
        const shops = await ShopModel.find({ name_Shop: { $regex: search }, shopActive: true, "address.cityName": cityName },
            { _id: 1, name_Shop: 1 })
        const products = await ProductModel.aggregate([
            {
                $match: {
                    $and: [
                        { name: { $regex: search } },
                        { isActive: true }
                    ],
                },
            },
            {
                $lookup: {
                    from: ShopModel.collection.name,
                    localField: 'shopId',
                    foreignField: '_id',
                    as: 'shop',
                },
            },
            {
                $match: {
                    $and: [
                        { 'shop.address.cityName': cityName },
                        { 'shop.shopActive': true },
                    ],
                },
            },
            {
                $project: {
                    _id: 1, name: 1, priceDescription: 1,
                    shop: { _id: 1, name_Shop: 1 }
                }
            }
        ]);
        res.status(200).json({
            status: 200, success: true, mainCategory, SubCategory, sub_SubCategory, shops, products
        })

    } catch (error) {
        next({ error, status: 400 })
    }
}

export const logoutShop = async (req: Request, res: Response, next: NextFunction) => {
    try {
        res.clearCookie("shop");
        res.status(201).json({
            status: 201, success: true,
            message: " از حساب فروشگاهی خود خارج شدید "
        })
    } catch (error) {
        next({ error, status: 400 });
    }
}


