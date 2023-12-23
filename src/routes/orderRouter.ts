import express from "express";
import {checkLogin} from "../middleWare/checkLogin";
import { deleteOrders, orders, submitOrder } from "../controller/orderController";
import { checkRole } from "../validation/roleCheck";

const orderRouter = express.Router();

orderRouter.post("/", checkLogin,submitOrder);//
orderRouter.get("/", checkLogin,orders(1));//
orderRouter.get("/one-order", checkLogin,orders(2));//
orderRouter.get("/orders", checkLogin,checkRole("order","read"),orders(3));//
orderRouter.get("/one-orders", checkLogin,checkRole("order","read"),orders(4));//
orderRouter.delete("/", checkLogin,checkRole("order","delete"),deleteOrders);//


export {orderRouter}; 