import * as yup from "yup";

const userSchema = yup.object().shape({
    name: yup.string().min(3,"حداقل 3 کاراکتر برای نام وارد کنید"),
    lastName: yup.string().min(3,"حداقل 3 کاراکتر برای نام خانوادگی وارد کنید"),
});

const updateUserSchema=yup.object().shape({
    name: yup.string().min(3,"حداقل 3 کاراکتر برای نام وارد کنید"),
    lastName: yup.string().min(3,"حداقل 3 کاراکتر برای نام خانوادگی وارد کنید"),
    email: yup.string().matches(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/,"ایمیل صحیح نمی باشد"),
})

export { userSchema,updateUserSchema};