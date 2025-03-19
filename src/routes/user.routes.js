import { Router } from "express";
import { loginUser, logoutUser, registerUser } from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { VerfyJwt } from "../middlewares/auth.middleware.js";

const router = Router()

router.route("/register").post(
    upload.fields([
        {
            name: "profileImage",
            maxCount: 1
        }
    ]),
    registerUser
)
//loggedInUser
router.route("/login").post(loginUser)
router.route("/logout").post(VerfyJwt, logoutUser)//add custom middleware to access cookei to allow logout and clear refresh token

export default router