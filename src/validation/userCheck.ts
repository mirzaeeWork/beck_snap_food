import { Request } from "express";
import { verifyToken } from "../moduls/utils";
import { UserModel } from "../models/userModel";

const isLogin = async (req: Request) => {
  const rememberMe = req?.cookies?.rememberMe;
  if (!rememberMe) return false;
  const { phoneNumber } = verifyToken(rememberMe);
  let user = await UserModel.findOne({ phoneNumber });
  if (!user ) return false;
  return true;
};

const checkCookie = async (phoneNumber: string) => {
  const result = await UserModel.findOne(
    { phoneNumber, name: { $exists: true, $ne: null }, lastName: { $exists: true, $ne: null } }
  );
}

export { isLogin, checkCookie };


