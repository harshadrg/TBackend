 import multer from "multer";
 const storage = multer.diskStorage({
    destination: function(req, file, cb){
        cb(null, "./public/temp")
    },
    filename: function(req, file, cb){
        const uniqueSuffix = Data.now() + '-' + Math.random(Math.random() * 1E9)
        cb(null, file.filename + '-' + uniqueSuffix)
    }
 })
 export const upload = multer({
    storage
 })