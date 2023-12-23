import * as yup from "yup";

//***************postman for addOrUpdaterole*/
// { "passwordOwner":"websiteOen",
// "title":"USER",
// "permissions":
//     [
//         {"name":"user","crud":["read","create","update"]},
//         {"name":"product","crud":["read"]},
//         {"name":"seller","crud":["read"]}
//     ]
//  }
//***************postman */


const RoleSchema = yup.object().shape({
  title: yup.string().min(3, 'حداقل 3 کاراکتر برای عنوان نقش وارد کنید'),
  permissions: yup.array().of(
    yup.object().shape({
      name: yup.string().min(3, 'حداقل 3 کاراکتر برای نام مجوز وارد کنید').required('نام مجوز وارد شود'),
      crud: yup.array()
        .of(yup.string().min(3, 'حداقل 3 کاراکتر برای نام عملیات وارد کنید').required('نام عملیات وارد شود'))
        .min(1, 'حداقل یک عملیات وارد شود').required('یک عملیات وارد شود')
    })
  ).min(1, 'حداقل یک مجوز وارد شود')
});
export { RoleSchema};
