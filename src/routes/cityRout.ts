import express, { Express, Request, Response, NextFunction } from 'express';
import { addCity,getCity,updateCity,deleteCity } from '../controller/cityController';
import { checkLogin } from '../middleWare/checkLogin';
import { checkRole } from '../validation/roleCheck';

const CityRouter: Express = express();

CityRouter.post("/",checkLogin,checkRole("city","create"),addCity)//
CityRouter.get("/",getCity)//
CityRouter.put("/",checkLogin,checkRole("city","update"),updateCity)//
CityRouter.delete("/",checkLogin,checkRole("city","delete"),deleteCity)//



export {CityRouter}; 
