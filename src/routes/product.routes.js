import { Router } from "express";
import { registerProduct } from "../controllers/product.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { checkCategory } from "../middlewares/checkCategory.middleware.js";

const router = Router()

router.route("/register").post(
    upload.fields([
        {
            name: "productImages",
            maxCount: 4
        }
    ]),
    checkCategory,
    registerProduct
)

export default router