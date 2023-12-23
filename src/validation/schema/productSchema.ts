import * as yup from "yup";


export const productSchema = yup.object().shape({
    name: yup.string().min(3, "حداقل 3 کاراکتر برای نام وارد کنید"),
    description: yup.string().min(3, "حداقل 3 کاراکتر برای توضیحات وارد کنید"),
    priceDescriptions: yup.array().of(
        yup.object().shape({
            name: yup.string().min(3, 'حداقل 3 کاراکتر برای نام قیمت وارد کنید'),
            price: yup.number().min(1, 'قیمت  باید بزرگتر از صفر باشد').required('قیمت وارد شود')
        })
    ).required('حداقل یک قیمت وارد شود'),
    discount:yup.number().min(5, 'تخفیف  باید بزرگتر از 5 درصد باشد').max(100, 'تخفیف نمی‌تواند بیشتر از 100 درصد باشد'),
    remainderCcount:yup.number().min(1, 'تعداد محصول باید بیشتر از 1 باشد')
});

export const productValidation = async (name: string, description: string,
    priceDescriptions: any, url: string) => {
    if (!await productSchema.validate({ name, description, priceDescriptions }
        , { abortEarly: false })) {
        require("fs").unlinkSync(require("path").join(__dirname, "..", "..", "public", url));
        await productSchema.validate({ name, description, priceDescriptions }
            , { abortEarly: false })
    }
}

export const productUpdateValidation= async (name: string, description: string,
    priceDescriptions: any, url: string,discount:string,remainderCcount:string) => {
    if (!await productSchema.validate({ name, description, priceDescriptions,discount, remainderCcount}
        , { abortEarly: false })) {
        require("fs").unlinkSync(require("path").join(__dirname, "..", "..", "public", url));
        await productSchema.validate({ name, description, priceDescriptions ,discount, remainderCcount}
            , { abortEarly: false })
    }
}

