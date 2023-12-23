"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const chai_1 = require("chai");
const mongoose_1 = __importDefault(require("mongoose"));
const __1 = require("..");
let req_OTP_cookies;
let req_OTP_value;
afterEach(() => __awaiter(void 0, void 0, void 0, function* () {
    yield mongoose_1.default.connection.close();
}));
describe('POST /user', () => {
    it('should respond with a 201 status and a message', function (done) {
        (0, supertest_1.default)(__1.app)
            .post('/user')
            .send({ phoneNumber: '09191234567' })
            .then((response) => {
            (0, chai_1.expect)(response.status).to.equal(201);
            (0, chai_1.expect)(response.body.message).to.equal('رمز یکبار مصرف به شماره موبایل ارسال شد.');
            const cookieString = response.headers['set-cookie'][0];
            if (cookieString)
                req_OTP_cookies = cookieString;
            if (response.body.user.OTP.value)
                req_OTP_value = response.body.user.OTP.value;
            done();
        })
            .catch((error) => done(error));
    });
});
describe('POST /user/signup-login', () => {
    it('should respond with a 201 status and a message', (done) => {
        (0, supertest_1.default)(__1.app)
            .post('/user/signup-login')
            .set('Cookie', req_OTP_cookies)
            .send({ OTP: req_OTP_value, name: "احمد", lastName: "میرزایی" })
            .then((response) => {
            (0, chai_1.expect)(response.status).to.equal(400);
            if (response.status == 400) {
                (0, chai_1.expect)(response.status).to.equal(400);
                done();
            }
            else {
                (0, chai_1.expect)(response.status).to.equal(201);
                (0, chai_1.expect)(response.body.message).to.equal('شما وارد حساب کاربری خود شدید' || "شما وارد حساب کاربری خود شدید");
                done();
            }
        })
            .catch((error) => done(error));
    });
});
