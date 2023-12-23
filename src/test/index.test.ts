import request from 'supertest';
import { expect } from 'chai';
import mongoose from 'mongoose';
import { app } from '..';


let req_OTP_cookies: string;
let req_OTP_value: string;

// beforeEach(async () => {
//   await mongoose.connect('mongodb://127.0.0.1:27017/test-back-snap-food');
// });

/* Closing database connection after each test. */
afterEach(async () => {
  await mongoose.connection.close();
});


describe('POST /user', () => {

  it('should respond with a 201 status and a message', function (done) {
    request(app)
      .post('/user')
      .send({ phoneNumber: '09191234567' })
      .then((response) => {
        expect(response.status).to.equal(201);
        expect(response.body.message).to.equal('رمز یکبار مصرف به شماره موبایل ارسال شد.');
        const cookieString = response.headers['set-cookie'][0];
        if (cookieString) req_OTP_cookies=cookieString
        if(response.body.user.OTP.value) req_OTP_value=response.body.user.OTP.value
        done(); 
      })
      .catch((error) => done(error)); // Call done with an error if any
  });
  // Add more tests as needed
});

describe('POST /user/signup-login', () => {
  it('should respond with a 201 status and a message', (done) => {
    request(app)
      .post('/user/signup-login')
      .set('Cookie',  req_OTP_cookies) // Replace with an actual token
      .send({ OTP: req_OTP_value ,name:"احمد",lastName:"میرزایی"}) // Replace with an actual OTP
      .then((response) => {
        expect(response.status).to.equal(400);
        if (response.status == 400 ) {
          expect(response.status).to.equal(400);

          done();
        } else {
          expect(response.status).to.equal(201);
          expect(response.body.message).to.equal('شما وارد حساب کاربری خود شدید' || "شما وارد حساب کاربری خود شدید");
          done();
        }        
      })
      .catch((error) => done(error));
  });
});