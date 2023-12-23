import express, { Express, Request, Response, NextFunction } from 'express';
import { checkLogin } from '../middleWare/checkLogin';
import { checkRole } from '../validation/roleCheck';
import { addAndUpdateWallet, deleteWallet, getWallet } from '../controller/walletController';

const walletRouter: Express = express();

walletRouter.post("/",checkLogin,addAndUpdateWallet)//
walletRouter.get("/",checkLogin,getWallet(1))//
walletRouter.get("/get",checkLogin,checkRole("wallet","read"),getWallet(2))//
walletRouter.delete("/",checkLogin,checkRole("wallet","delete"),deleteWallet)//




export {walletRouter}; 
