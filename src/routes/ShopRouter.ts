import express, { Express } from 'express';
import {  deleteShop, getAllShopFalse, getNameSearch, getShopProduct, getShopProductTrue, login_shop, logoutShop, req_otp_shop,
     sendOTP_shop, setActive, setOpen, update_first, update_second,  } from '../controller/ShopController';
import { checkLogin, checkLoginShop } from '../middleWare/checkLogin';
import { upload } from '../moduls/multer';
import { checkRole } from '../validation/roleCheck';
import { setLocation } from '../moduls/setAddress';


const ShopRouter: Express = express();

ShopRouter.post("/",req_otp_shop);//
ShopRouter.get("/send_otp_shop",sendOTP_shop);//
ShopRouter.post("/login",login_shop);//
ShopRouter.post("/update_first",checkLoginShop,update_first);//
ShopRouter.post("/update_second",checkLoginShop,upload.array("img-shop",2),update_second);//
ShopRouter.post("/set_open",checkLoginShop,setOpen);//
ShopRouter.put("/",checkLoginShop,logoutShop);//
ShopRouter.get("/get-product",checkLoginShop,getShopProduct(1))//
ShopRouter.get("/get_Shop_product",setLocation,getShopProductTrue);//   
ShopRouter.get("/get-all-shop",checkLogin,checkRole("shop","read"),getAllShopFalse)//
ShopRouter.get("/get_shop",checkLogin,checkRole("shop","read"),getShopProduct(2))//
ShopRouter.get("/get_shop_id",checkLogin,checkRole("shop","read"),getShopProduct(3))//
ShopRouter.post("/set_active",checkLogin,checkRole("shop","update"),setActive);//
ShopRouter.delete("/",checkLogin,checkRole("shop","delete"),deleteShop);//
//====================================
ShopRouter.get("/search", getNameSearch);


export  {ShopRouter}
