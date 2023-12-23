import express from "express";
import {checkLogin} from "../middleWare/checkLogin";
import { checkPermisson } from "../validation/roleCheck";
import {  UpdateRole, addRole, createOwner, deleteRole, getAllRole, getOneRole } from "../controller/roleController";

const roleRouter = express.Router();

roleRouter.post("/createOwner",checkLogin,createOwner);//
roleRouter.post("/", checkLogin,checkPermisson,addRole);//
roleRouter.put("/", checkLogin,checkPermisson,UpdateRole);//
roleRouter.get("/", checkLogin,checkPermisson,getAllRole);//
roleRouter.get("/getOneRole", checkLogin,checkPermisson,getOneRole);//
roleRouter.delete("/",checkLogin,checkPermisson,deleteRole);//


export {roleRouter}; 