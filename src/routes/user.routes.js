import { Router } from "express";
import { loginUser, logoutUser, refreshAccessToken, registerUser } from "../controllers/user.controller.js";
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
router.route("/login").post(loginUser)
//secured routes : user is logged in
router.route("/logout").post(VerfyJwt, logoutUser)//add custom middleware to access cookei to allow logout and clear refresh token
router.route("/refresh-token").post(refreshAccessToken)

export default router