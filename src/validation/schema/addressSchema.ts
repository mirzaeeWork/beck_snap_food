import * as yup from "yup";

const addressSchema = yup.object().shape({
    city: yup.string().min(2,"حداقل 2 کاراکتر برای نام شهر وارد کنید"),
    address: yup.string().min(10,"حداقل 10 کاراکتر برای آدرس وارد کنید"),
});

const addressLoginSchema=yup.object().shape({
    cityName: yup.string().min(2,"حداقل 2 کاراکتر برای نام شهر وارد کنید"),
    addressChoose: yup.string().min(5,"حداقل 5 کاراکتر برای انتخاب آدرس وارد کنید"),
    addressDetails: yup.string().min(5,"حداقل 5 کاراکتر برای جزئیات آدرس وارد کنید"),
});

export { addressSchema,addressLoginSchema};