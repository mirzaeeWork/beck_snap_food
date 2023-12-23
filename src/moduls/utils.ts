import  {  Request, Response, NextFunction } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import otpGenerator from 'otp-generator';
import * as dotenv from 'dotenv';
dotenv.config();


const saltRounds = 8;

const userHashed = (text: any): string => {
    const salt = bcrypt.genSaltSync(saltRounds);
    const hashed = bcrypt.hashSync(text, salt);
    if (hashed) {
        return hashed
    }
    return ""
}

const checkUserHashed = async (text: any, textHashed: any) => {
    const compareHashed = await bcrypt.compare(text, textHashed);
    return compareHashed
}

const verifyToken = (token: any):any=> {
    if (process.env.SECRET_KEY) {
        return (jwt.verify(token, process.env.SECRET_KEY));
    }
}


const createToken = (data: any,exp:string): string => {
    if (process.env.SECRET_KEY) {
        return jwt.sign(data
            , process.env.SECRET_KEY
            , { expiresIn: exp}   
            )
    }
    else { return "" }
}

const otp_Generator = ():string => {
    return otpGenerator.generate(6, {
        upperCaseAlphabets: false,
        specialChars: false,
        lowerCaseAlphabets: false,
    });
}

const handleFileError = (message: string,url:string) => {
    require("fs").unlinkSync(require("path").join(__dirname, "..", "public", url));
    return { message };
};

const handleFilesErrorShop = (message: string,urls:string[]) => {
    urls.map(url=>{
        require("fs").unlinkSync(require("path").join(__dirname, "..", "public", url));
    })
    return { message };
};

const sortForShow = async (sort: any , req: Request, next: NextFunction) => {
    try {
        let sorted:any;
        if(!sort) sorted={ $sort: { "name_Shop" : 1 } }
        if(sort=="recent") sorted={ $sort: { "createdAt" : -1 } }
        if(sort=="nearest") sorted={ $sort: { "distance" : 1 } }
        if(sort=="least_expensive") sorted={ $sort: { "ProductPriceAvg" : 1 } }
        if(sort=="most_expensive") sorted={ $sort: { "ProductPriceAvg" : -1 } }
        return sorted

    } catch (error) {
        next({ error, status: 400 });

    }
}




export {verifyToken,createToken,otp_Generator,sortForShow,
    handleFileError,handleFilesErrorShop,checkUserHashed,userHashed}
