import express from "express";
import { checkLogin, checkLoginShop } from "../middleWare/checkLogin";
import { checkRole } from "../validation/roleCheck";
import { addProduct, deleteProduct, setavailableProduct, getOneProduct, setproduct, updateProduct } from "../controller/ProductController";
import { upload } from "../moduls/multer";
const prodRouter = express.Router();

prodRouter.post("/",checkLoginShop,upload.single("prod"),addProduct);//
prodRouter.put("/",checkLoginShop,upload.single("prod"),updateProduct);//
prodRouter.put("/available",checkLoginShop,setavailableProduct);//
prodRouter.delete("/",checkLoginShop,deleteProduct);//
prodRouter.get("/seller",checkLoginShop,getOneProduct(1));//
prodRouter.get("/",getOneProduct(2));//
prodRouter.patch("/", checkLogin,checkRole("product","update"),setproduct)//
prodRouter.get("/product",checkLogin,checkRole("product","read"),getOneProduct(3));//



export {prodRouter}; 