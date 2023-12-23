import multer from "multer"
import fs from "fs";
import path from "path";



const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const accessFormat = ["png", "jpeg", "jpg", "webp"]
        if (!accessFormat.includes(file.mimetype.split("/")[1])) {
            return cb(new Error("این فرمت پشتیبانی نمی شود"), new Boolean(false).toString());
        }
        const year = new Date().getFullYear();
        const month = new Date().getMonth() + 1;
        const day = new Date().getDate();
        const test = path.join(__dirname, "..", "public", "uploads", "image",
            String(year), String(month), 
            String(day),
            );
        fs.mkdirSync(test, { recursive: true });
        cb(null, test);
    },
    
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
        cb(null, file.fieldname + '-' + uniqueSuffix + '.' + file.mimetype.split("/")[1])
    }
})



const upload = multer({ storage: storage, limits: { fileSize: 400 * 1024 }, })


export { upload }