import express, { Express, Request, Response, NextFunction } from 'express';
import { upload } from '../moduls/multer';
import { checkLogin } from '../middleWare/checkLogin';
import {
    CreateSub_SubCategory, DeleteSub_SubCategory, UpdateSub_SubCategory, addSubCategory,
    deleteSubCategory,
    getOneSubCategory, getOneSubSubCategory, updateSubCategory
} from '../controller/SubCategoryController';
import { checkRole } from '../validation/roleCheck';
import { setLocation } from '../moduls/setAddress';

const SubCatRouter: Express = express();

SubCatRouter.post("/", checkLogin,checkRole("subCategory","create"), upload.single("sub-cat"), addSubCategory)//
SubCatRouter.get("/one-sub-category",setLocation, getOneSubCategory)//با آدرس   //
SubCatRouter.get("/one-second-category", setLocation, getOneSubSubCategory)//با آدرس   //
SubCatRouter.put("/", checkLogin, checkRole("subCategory","update"),upload.single("sub-cat"), updateSubCategory)//
SubCatRouter.delete("/", checkLogin,checkRole("subCategory","delete"),  deleteSubCategory)//
SubCatRouter.post("/second-category", checkLogin,checkRole("subCategory","update"), upload.single("sub-cat"), CreateSub_SubCategory)//
SubCatRouter.put("/second-category", checkLogin,checkRole("subCategory","update"), upload.single("sub-cat"), UpdateSub_SubCategory)//
SubCatRouter.delete("/second-category", checkLogin,checkRole("subCategory","update"),  DeleteSub_SubCategory)//


export { SubCatRouter }; 
