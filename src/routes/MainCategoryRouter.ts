import express, { Express } from 'express';
import { addMainCategory, deleteCategory, getAllCategory, getOneCategory, updateCategory } from '../controller/MainCategoryController';
import { upload } from '../moduls/multer';
import { checkLogin } from '../middleWare/checkLogin';
import { checkRole } from '../validation/roleCheck';
import { setLocation } from '../moduls/setAddress';


const CatRouter: Express = express();

CatRouter.post("/",checkLogin,checkRole("mainCategory", "create"),upload.single('main-cat'),addMainCategory);//
CatRouter.get("/", getAllCategory)//   
CatRouter.get("/one-category", setLocation, getOneCategory)//با آدرس    //
CatRouter.put("/", checkLogin, checkRole("mainCategory", "update"), upload.single("main-cat"), updateCategory)//
CatRouter.delete("/", checkLogin, checkRole("mainCategory", "delete"), deleteCategory)//


export { CatRouter }; 
