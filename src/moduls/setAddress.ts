import { Request, Response, NextFunction } from 'express';
import * as dotenv from 'dotenv';
import { isLogin } from '../validation/userCheck';
import { createToken, verifyToken } from './utils';
import { addressLoginSchema, addressSchema } from '../validation/schema/addressSchema';
import CityModel from '../models/cityModel';
import * as turf from '@turf/turf';

dotenv.config();

declare module 'express' {
    interface Request {
        location?: string;
    }
}


export const getLatLng = async (city: string, address: string) => {
    const newAddress = city + ' ' + address
    try {
        const response = await fetch(
            `https://api.neshan.org/v4/geocoding?address=${newAddress}`,
            {
                headers: {
                    'Api-Key': `${process.env.Api_Key_Neshon}`,
                },
            }
        );

        if (!response.ok) {
            throw new Error(`Error: ${response.status}`);
        }

        const data = await response.json();

        if (data?.location) {
            const newLocation = data.location;
            let lat: string = newLocation.y.toString();
            let lng: string = newLocation.x.toString();
            return { lat, lng };
        }
        return ""
    } catch (error) {
        console.error(error);
    }
};

export const setLocationCookie = (res: Response, location: string) => {
    return new Promise<void>((resolve) => {
        res.cookie("location", location, { httpOnly: true, sameSite: "strict", secure: true });
        resolve();
    });
};



export const setLocation = async (req: Request, res: Response, next: NextFunction) => {
    try {
        //example for json file in postman
        // {
        //     "city" :"تهران",
        //     "address":"آزادی، شادمهر، جوزانی کهن"
        // }
        const location = req?.cookies?.location;
        if (!await isLogin(req) && !location) {
          const { cityName, addressChoose } = req.body
          if (!cityName || !addressChoose) throw { message: "لطفا شهر و آدرس را وارد کنید" };
    
          await addressLoginSchema.validate({ cityName, addressChoose }, { abortEarly: false });
          const city = await CityModel.findOne({ title: cityName });
          if (!city) throw { message: "نام شهر مجاز نمی باشد" };
          const result = await getLatLng(cityName, addressChoose)
          if (!result) throw { message: "طول و عرض جغرافیایی نامعتبر است" }
          const { lat, lng } = result;
          const location = createToken({
            cityName: cityName, address: addressChoose,
            lat: lat, lng: lng
          }, "1y")
          req.location=location
          res.cookie("location", location, {
            httpOnly: true,
            sameSite: "strict",
            secure: true,
          });
        }
        next()
            
    } catch (error) {
        next({ error, status: 400 })
    }
}

export const setAddressForUser = async (cityName: string, addressChoose: string, addressDetails: string
) => {
    if (!cityName || !addressChoose || !addressDetails) return { message: "لطفا شهر وانتخاب آدرس و جزئیات آدرس را وارد کنید" };

    await addressLoginSchema.validate({ cityName, addressChoose, addressDetails }, { abortEarly: false });

    const city = await CityModel.findOne({ title: cityName });

    if (!city) return { message: "نام شهر مجاز نمی باشد" };
};


export const setCookieLocation = async (address: any, req: Request, res: Response, next: NextFunction) => {
    try {
        if (!address) throw { message: "آدرس پیدا نشد یا بروزرسانی انجام نشد" };
        const location = createToken({
            _id: address._id,
            cityName: address.cityName, address: address.addressChoose + ' ' + address.addressDetails,
            lat: address.geoLocation.coordinates[0], lng: address.geoLocation.coordinates[1]
        }, "1y")
        res.cookie("location", location, {
            httpOnly: true,
            sameSite: "strict",
            secure: true,
        });
    } catch (error) {
        next({ error, status: 400 })

    }

}



export const showAdresses = async (centerCoordinates: any, shops: any) => {
    let nearbyLocations: any;
    if (centerCoordinates) {
        const center = turf.point([centerCoordinates.lat, centerCoordinates.lng]);
        // console.log("center :", center);

        if (shops.length) {
            nearbyLocations = shops.filter((shop: any) => {
                const locationCoordinates = turf.point([shop.address.lat, shop.address.lng]);
                // console.log("locationCoordinates :",locationCoordinates)

                // Calculate the distance from the center point
                const distance = turf.distance(center, locationCoordinates);
                // console.log("distance :",distance)


                return distance < 5 ;             
            });
        }
    }
    return nearbyLocations;
}

export const isNearAddress=(address:any,req: Request,next: NextFunction)=>{
    try {
        const location = req?.cookies?.location || req.location;
        if (!location) throw { message: "ابتدا یک آدرس انتخاب کنید" };
        const { _id,lat, lng, cityName } = verifyToken(location );
        if(address.cityName != cityName) throw { message: "شهر انتخابی با شهر فروشگاه متفاوت است" };
        const center = turf.point([lat, lng]);

        const locationCoordinates = turf.point(address.geoLocation.coordinates);
        // console.log("locationCoordinates :",locationCoordinates)

        // Calculate the distance from the center point
        const distance = turf.distance(center, locationCoordinates);
        const addressId=_id
        return {distance ,addressId}
        
    } catch (error) {
        next({ error, status: 400 })
    }

}


