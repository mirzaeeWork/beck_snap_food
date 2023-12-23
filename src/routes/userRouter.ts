import express, { Express } from 'express';
import { reqOTPuser, sendOTPuser,createAddress,updateAddress,updateUser,getProfile,
    selectAddress,deleteAddress,logout,getUser, SetRole, deleteUser,CreateLink, reqOTPUserBylink, sendOTPUserBylink, getAddress, SetForAllLinkDiscount, getAllUser } from '../controller/userController';
import { checkLogin } from '../middleWare/checkLogin';
import {  checkRole } from '../validation/roleCheck';

const userRouter: Express = express();

userRouter.post("/",reqOTPuser)//
userRouter.post("/signup-login",sendOTPuser)//
userRouter.get("/get-profile",checkLogin,getProfile);//
userRouter.post("/create-address",checkLogin,createAddress)//
userRouter.get("/select-address",checkLogin,selectAddress)//
userRouter.post("/update-address",checkLogin,updateAddress)//
userRouter.get("/get_address",checkLogin,getAddress)//
userRouter.post("/delete-address",checkLogin,deleteAddress)//
userRouter.post("/update-user",checkLogin,updateUser)//
userRouter.post("/create_link",checkLogin,CreateLink)//
userRouter.post("/by-link",reqOTPUserBylink)//
userRouter.post("/signup-by-link",sendOTPUserBylink)//
userRouter.post("/logout",checkLogin,logout)//
userRouter.post("/set-role",checkLogin,checkRole("user","setRole"),SetRole)//
userRouter.post("/set-discount",checkLogin,checkRole("user","update"),SetForAllLinkDiscount)//
userRouter.get("/get-user",checkLogin,checkRole("user","read"),getUser);//
userRouter.get("/get-all-user",checkLogin,checkRole("user","read"),getAllUser);
userRouter.delete("/delete-user",checkLogin,checkRole("user","delete"),deleteUser);//


export {userRouter}; 

