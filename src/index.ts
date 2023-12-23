import express, { Express, Request, Response, NextFunction } from 'express';
import { connectedDB } from './DB/connectedDB';
import { errorHandler, notFound } from './routes/error/error';
import { Router } from './routes/router';
import cookieParser from 'cookie-parser';
import cors from 'cors'
import path from "path";

const app: Express = express();
import * as dotenv from 'dotenv';
import { checkAndRenewCookie } from './middleWare/checkLogin';
import { checkUserHashed, userHashed } from './moduls/utils';
dotenv.config();

      
try {
    connectedDB();
} catch (err) {
    console.log(err)
}

app.use(express.json());
app.use(cookieParser())
//This part is for the frontEnd**********************
app.use(cors({
    origin: 'http://localhost:3001', 
    credentials: true,
}));
//This part is for the frontEnd*******************

app.use(express.static(path.join(__dirname, "public")))
app.use(express.urlencoded({ extended: true }));
app.use(checkAndRenewCookie);


app.use("/", Router);

app.use(notFound);
app.use(errorHandler);
app.listen(+`${process.env.Port}`, () => console.log(`Server is running on port ${process.env.Port}`));

export { app } //for test
