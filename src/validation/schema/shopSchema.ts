import * as yup from "yup";

const ShopSchema = yup.object().shape({
    name_Shop: yup.string().min(3,"حداقل 3 کاراکتر برای نام مغازه وارد کنید"),
    name_ShopOwner: yup.string().min(2,"حداقل 2 کاراکتر برای نام مالک مغازه وارد کنید"),
    lastName_ShopOwner: yup.string().min(2,"حداقل 3 کاراکتر برای نام خانوادگی مالک مغازه وارد کنید"), 
});

export { ShopSchema};