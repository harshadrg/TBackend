import { Router } from "express";
import { changeCurrentPassword, getCurrentUser, loginUser, logoutUser, refreshAccessToken, registerUser, updateAccountDetails, updateProfileImage } from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { VerifyJwt } from "../middlewares/auth.middleware.js";

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
router.route("/logout").post(VerifyJwt, logoutUser)//add custom middleware to access cookei to allow logout and clear refresh token
router.route("/refresh-token").post(refreshAccessToken)
router.route("/change-password").post(VerifyJwt, changeCurrentPassword)
router.route("/personal-details").get(VerifyJwt, getCurrentUser)
router.route("/update-details").patch(VerifyJwt, updateAccountDetails)
router.route("/profile-image").patch(VerifyJwt, upload.single("profileImage"), updateProfileImage)

export default router