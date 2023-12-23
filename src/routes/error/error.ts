import express, { Express, Request, Response, NextFunction } from 'express';

const notFound = (req:Request, res:Response, next:NextFunction) => {
    res.status(404).json({ message: "notfound" });
  };
  
  const errorHandler = (error: any, req: Request, res: Response, next: NextFunction) => {
    // console.log(error)
    const status=error.status || 500
    // error.error.errors   ==>   می باشد  signupSchema برای خطاهای 
    // error.error.message  ==> برای خطاهایی مثل -نام کاربری تکراری است- می باشد
    //error.message ==> می باشد multer برای 
    
    const message=error?.error?.message || error?.error?.errors || error?.message ||"internal server error";
    res.status(400).json({ status,message, success: false }); 
  
  };
  
  export { notFound, errorHandler };
  