import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uplodeOnCloudinary } from "../utils/cloudinary.js";

const registerUser = asyncHandler(async (req, res) => {
    const {userFullName, username, email, phoneNumber, password, address, location}= req.body;
    // const FullName = Object.assign({},userFullName)
    // const FullName = {...userFullName}
    if (
        [ Object.values(userFullName).join(""), email, phoneNumber, password, Object.values(address[0]).join("") ].some((field)=>
        field?.trim()==="")
    ) {
        throw new ApiError(400, "All (e,pn,ps) fields are required")
    }
    
    const existedUser = await User.findOne({
        $or:[{ username }, { email }, { phoneNumber }]
    })
    if (existedUser) {
        throw new ApiError(409, "User with usernaame/email or phone number already existed")
    }

    let profileImageLocalPath;
    if (req.files && Array.isArray(req.files.profileImage) && req.files.profileImage.length > 0) {
        profileImageLocalPath = req.files?.profileImage[0]?.path;
    }
    const profileImages = await uplodeOnCloudinary(profileImageLocalPath)
    // if (!profileImages) {
    //     throw new ApiError(400, "ProfileImage file is requireed")
    // }
    // if (!profileImageLocalPath) {
    //     throw new ApiError(400, "ProfileImage file is requireed")
    // }
    // const FullName = {...userFullName}
    // const fullUserName = Object.values(FullName).join("")      
    const user =await User.create({
        userFullName,
        profileImage: profileImages?.url || process.env.DEFAULT_PROFILEIMAGE,
        email,
        phoneNumber,
        password,
        address,
        location,
        username: username.toLowerCase()
    })
    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )
    if (!createdUser) {
        throw new ApiError(500, "something went wrong when registering user")
    }
    return res.status(201).json(
        new ApiResponse(200, createdUser, "User Registered Successfully")
    )
})
export {registerUser}