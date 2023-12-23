import express from "express";
import { addProductGroup, deleteProductGroup,  getOneProductGroup, getOneProductGroupTrue, setproductsGroup, updateProductGroup } from "../controller/ProductGroupController";
import { checkLogin, checkLoginShop } from "../middleWare/checkLogin";
import { checkRole } from "../validation/roleCheck";
const prodGroupRouter = express.Router();

prodGroupRouter.post("/",checkLoginShop,addProductGroup);//
prodGroupRouter.put("/",checkLoginShop,updateProductGroup);//
prodGroupRouter.delete("/",checkLoginShop,deleteProductGroup);//
prodGroupRouter.get("/seller",checkLoginShop,getOneProductGroup(1));//
prodGroupRouter.get("/",getOneProductGroupTrue);//
prodGroupRouter.patch("/", checkLogin,checkRole("productGroup","update"),setproductsGroup)//
prodGroupRouter.get("/products-group",checkLogin,checkRole("productGroup","read"),getOneProductGroup(2));//



export {prodGroupRouter}; 