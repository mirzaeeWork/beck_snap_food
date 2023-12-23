import express, { Request, Response, NextFunction } from 'express';
import { CatRouter } from './MainCategoryRouter';
import { CityRouter } from './cityRout';
import { userRouter } from './userRouter';
import { SubCatRouter } from './SubCategoryRouter';
import { ShopRouter } from './ShopRouter';
import { roleRouter } from './roleRouter';
import { prodGroupRouter } from './productGroupRouter';
import { prodRouter } from './productRouter';
import { orderRouter } from './orderRouter';
import { walletRouter } from './walletRouter';



const Router = express.Router();

Router.use("/category", CatRouter);
Router.use("/city", CityRouter);
Router.use("/user", userRouter);
Router.use("/sub-category", SubCatRouter);
Router.use("/shop", ShopRouter);
Router.use("/role", roleRouter);
Router.use("/prodGroup", prodGroupRouter);
Router.use("/prod", prodRouter);
Router.use("/order", orderRouter);
Router.use("/wallet", walletRouter);



Router.get('/', async (req: Request, res: Response, next: NextFunction) => {
    try {
        res.status(200).json("server is running");
    } catch (error) {
        next({ error, status: 400 })

    }
})


export { Router }
