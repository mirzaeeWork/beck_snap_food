import * as yup from "yup";

const citySchema = yup.object().shape({
    code: yup.string().min(3,"حداقل 3 کاراکتر وارد کنید").required("لطفا کد وارد کنید"),
    title: yup.string().min(2,"حداقل 2 کاراکتر وارد کنید").required("لطفا عنوان وارد کنید"),
    lat: yup.string().min(2,"حداقل 2 کاراکتر وارد کنید").required("لطفا عرض جغرافیایی وارد کنید"),
    lng: yup.string().min(2,"حداقل 2 کاراکتر وارد کنید").required("لطفا طول جغرافیایی وارد کنید"), 
});

export { citySchema};