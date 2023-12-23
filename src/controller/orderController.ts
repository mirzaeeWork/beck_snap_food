import express, { Express, Request, Response, NextFunction } from 'express';
import mongoose, { isValidObjectId } from 'mongoose';
import { ShopModel } from '../models/ShopModel';
import { ProductModel } from '../models/productModel';
import { isNearAddress } from '../moduls/setAddress';
import { OrderModel } from '../models/orderModel';
import { phoneNumberNormalizer, phoneNumberValidator } from '@persian-tools/persian-tools';
import moment from 'jalali-moment';
import walletModel from '../models/walletModel';
import { UserModel } from '../models/userModel';


export const submitOrder = async (req: Request, res: Response, next: NextFunction) => {
    // {
    //     "shopId": "6574706cda8c96fdd2ec1759",
    //     "orderProducts": [
    //         {
    //             "productId": "65731c96da8c96fdd2eb7f28",
    //             "price": 560000,
    //             "count": 1,
    //             "discount": 0
    //         }
    //     ],
    //     "paymentMethod": "online"
    // }
    try {
        const { shopId, orderProducts, paymentMethod } = req.body
        if (!isValidObjectId(shopId)) throw { message: "شناسه معتبر نمی باشد" };
        let prductPriceSum = 0
        const shop = await ShopModel.findOne({ _id: shopId })
        if (!shop) throw { message: "فروشگاه وجود ندارد" }
        const result = await isNearAddress(shop.address, req, next)
        if (!result) throw { message: "آدرس مورد تایید نیست" }
        const { distance, addressId } = result
        // The distance below 5 km can be serviced
        if (distance > 10) {
            throw { message: "آدرس مورد نظر در محدوده سرویس دهی فروشگاه نمی باشد" };
        }
        //5,000 tomans is considered as a shipping fee for each kilometer
        const shippingCost = Math.ceil(distance * 1000) * 5
        for (let index = 0; index < orderProducts.length; index++) {
            const item = orderProducts[index]
            const product = await ProductModel.findOne({
                _id: item.productId,
                shopId, "priceDescription.price": item.price, isActive: true,
            },
                {
                    _id: 1, isAvailable: 1,
                    discount: 1
                })
            if (!product || !product.isAvailable) throw { message: "محصول وجود ندارد" }
            if (item.discount && item.discount != product.discount) throw { message: "تخفیف مجاز نیست" }
            if(item.count<1) throw {message:"حداقل تعداد محصول 1 می باشد"}
            const price = item.price;
            const discount = price * (item.discount / 100 || 0);
            prductPriceSum += ((price - discount) * item.count);
        }
        if (prductPriceSum < 100000) throw { message: "حداقل خرید 100 هزار تومان است" }
        const paymentMethods = ["online", "wallet"]
        if (!paymentMethods.includes(paymentMethod)) throw { message: "روش پرداختی پشتیبانی نمی شود" }
        const salesTax = prductPriceSum * ((shop.salesTax || 0) / 100);
        const orderSum = prductPriceSum + shippingCost + salesTax
        const currentDate = new Date();

        const persianDate = moment(currentDate).locale('fa').format('dddd jD jMMMM  HH:mm jYYYY');
        let paymentOnline = orderSum

        if (req.friendLinkForMe || req.myLinkForFriends) {
            const { message, discountForLink } = await DiscountForInvitationLink(paymentOnline, req)
            if (message) throw { message }
            if (discountForLink || discountForLink == 0) paymentOnline = discountForLink
        }

        if (paymentMethod == "wallet") {
            const { message, wallet } = await Wallet(paymentOnline, req)
            if (message) throw { message }
            if (wallet || wallet == 0) paymentOnline = wallet
        }

        const paymentStatus = "موفق"

        const order = await OrderModel.create({
            userPhoneNumber: req.phoneNumber, shopId, orderProducts, prductPriceSum,
            shippingCost, paymentMethod, orderSum, addressId, date: persianDate, paymentStatus, paymentOnline
        })
        if (!order) throw { message: "سفارش ثبت نشد" }
        res.status(201).json({
            status: 201, success: true,
            message: "سفارش مورد نظر ثبت شد", order
        })


    } catch (error) {
        next({ error, status: 400 })
    }
}

export const orders = (count: number) => async (req: Request, res: Response, next: NextFunction) => {
    try {
        let filter: any;
        if (count == 1) {
            filter = { userPhoneNumber: req.phoneNumber }
        } else if (count == 2) {
            const { _id } = req.body
            if (!isValidObjectId(_id)) throw { message: "شناسه معتبر نمی باشند" };
            filter = { _id: new mongoose.Types.ObjectId(_id), userPhoneNumber: req.phoneNumber }
        }
        else if (count == 3) {
            let { phoneNumber } = req.body
            if (!phoneNumberValidator(phoneNumber)) throw { message: "شماره موبایل وارد شده صحیح نمی باشد." };
            phoneNumber = phoneNumberNormalizer(phoneNumber, "0")
            filter = { userPhoneNumber: phoneNumber }
        }
        else if (count == 4) {
            let { _id, phoneNumber } = req.body
            if (!isValidObjectId(_id)) throw { message: "شناسه معتبر نمی باشند" };
            if (!phoneNumberValidator(phoneNumber)) throw { message: "شماره موبایل وارد شده صحیح نمی باشد." };
            phoneNumber = phoneNumberNormalizer(phoneNumber, "0")
            filter = { userPhoneNumber: phoneNumber }
        }


        const orders = await OrderModel.aggregate([
            {
                $match: filter
            },
            {
                $lookup: {
                    from: ShopModel.collection.name,
                    localField: "shopId",
                    foreignField: "_id",
                    as: "shop"
                }
            },
            {
                $lookup: {
                    from: ProductModel.collection.name,
                    localField: "orderProducts.productId",
                    foreignField: "_id",
                    as: "products"
                }
            },
            {
                $addFields: {
                    products: {
                        $map: {
                            input: "$orderProducts",
                            as: "orderProduct",
                            in: {
                                _id: "$$orderProduct.productId",
                                name: {
                                    $arrayElemAt: [
                                        "$products.name",
                                        { $indexOfArray: ["$products._id", "$$orderProduct.productId"] }
                                    ]
                                },
                                imageUrl: {
                                    $arrayElemAt: [
                                        "$products.imageUrl",
                                        { $indexOfArray: ["$products._id", "$$orderProduct.productId"] }
                                    ]
                                },
                                priceDescription: {
                                    $filter: {
                                        input: {
                                            $arrayElemAt: [
                                                "$products.priceDescription",
                                                { $indexOfArray: ["$products._id", "$$orderProduct.productId"] }
                                            ]
                                        },
                                        as: "item",
                                        cond: {
                                            $eq: ["$$item.price", "$$orderProduct.price"]
                                        }
                                    }
                                },
                                count: "$$orderProduct.count",
                                discount: "$$orderProduct.discount"
                            }
                        }
                    }
                }
            },
            {
                $project: {
                    _id: 1,
                    shop: { _id: 1, name_Shop: 1, brandImgUrl: 1,salesTax:1 },
                    products: 1,
                    prductPriceSum: 1,
                    shippingCost: 1,
                    orderSum: 1,
                    date: 1,
                    paymentStatus: 1
                }
            }
        ]);

        res.status(201).json({
            status: 201, success: true,
            orders
        })


    } catch (error) {
        next({ error, status: 400 })
    }
}


const Wallet = async (paymentOnline: number, req: Request):
    Promise<{ message: string, wallet: number }> => {
    const wallet = await walletModel.findOne({ userPhoneNumber: req.phoneNumber }, { IncreaseCredit: 1 })
    if (!wallet || wallet.IncreaseCredit == 0) {
        return { message: "", wallet: paymentOnline };
    }
    if (paymentOnline > wallet.IncreaseCredit) {
        paymentOnline = paymentOnline - wallet.IncreaseCredit;
        wallet.IncreaseCredit = 0;
    } else {
        wallet.IncreaseCredit = wallet.IncreaseCredit - paymentOnline;
        paymentOnline = 0;
    }
    wallet.save(); // Make sure to await the save operation

    return { message: "", wallet: paymentOnline };
};


const DiscountForInvitationLink = async (paymentOnline: number, req: Request):
    Promise<{ message: string, discountForLink: number }> => {

    if (!await OrderModel.findOne({ userPhoneNumber: req.phoneNumber })) {
        if (req.discountForLink && req.friendLinkForMe) {
            paymentOnline = paymentOnline - req.discountForLink
            const inviter = await UserModel.updateOne({ myLinkForFriends: req.friendLinkForMe }, {
                $inc: { numFriendsRegWithMyLink: 1 }
            })
            if (!inviter.modifiedCount) return { message: "دعوت کننده بروزرسانی نشد", discountForLink: paymentOnline }
        }
        if (req.discountForLink && req.myLinkForFriends) {
            const user = await UserModel.findOne({ phoneNumber: req.phoneNumber })
            if (user?.numFriendsRegWithMyLink && user?.discountForLink) {
                paymentOnline = paymentOnline - user.discountForLink;
                user.numFriendsRegWithMyLink -= 1;
                user.save()
            }
        }
    } else {
        const user = await UserModel.findOne({ phoneNumber: req.phoneNumber })
        if (user?.numFriendsRegWithMyLink && user?.discountForLink) {
            paymentOnline = paymentOnline - user.discountForLink;
            user.numFriendsRegWithMyLink -= 1;
            user.save()
        }
    }
    return { message: "", discountForLink: paymentOnline }
}

export const deleteOrders = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { phoneNumber } = req.body;
        if (!phoneNumberValidator(phoneNumber)) throw { message: "شماره موبایل وارد شده صحیح نمی باشد." };
        const phone = phoneNumberNormalizer(phoneNumber, "0")
        const result = await OrderModel.deleteMany({ userPhoneNumber: phone });
        if (!result.deletedCount) throw { message: "سفارشات حذف نشد" };
        res.status(200).json({
            status: 200, success: true,
            message: "سفارشات کاربر مورد نظر حذف شد"
        })

    } catch (error) {
        next({ error, status: 400 })
    }
}


