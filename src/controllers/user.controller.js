import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uplodeOnCloudinary } from "../utils/cloudinary.js";

const generateAccessAndRefreshTokens = async(userId)=>{
    try {
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()
        
        user.refreshToken = refreshToken
        await user.save({validateBeforeSave:false})//prevent default validation before saving the tokens 
        return {accessToken, refreshToken}
    } catch (error) {
        throw new ApiError(500,"something went wrong while generating Access and Refresh Tokens");        
    }
}

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
        "-password -refreshToken -phoneNumber -address -location" 
    )
    if (!createdUser) {
        throw new ApiError(500, "something went wrong when registering user")
    }
    return res.status(201).json(
        new ApiResponse(200, createdUser, "User Registered Successfully")
    )
});
const loginUser = asyncHandler(async(req, res)=>{

    const {username, email, phoneNumber, password} = req.body;
    if (!(username || email || phoneNumber)) {
        throw new ApiError(400, "username, email or phoneNo is required")
    }
    const user = await User.findOne({
        $or: [{ username }, { email }, { phoneNumber }] 
    })
    if (!user) {
        throw new ApiError(404, "user not found")
    }

    const isPassowrdValid = await user.isPassowrdCorrect(password)
    if (!isPassowrdValid) {
        throw new ApiError(401, "Invalid user credentials")
    }

    const {accessToken, refreshToken} = await generateAccessAndRefreshTokens(user._id)
    const loggedInUser = await User.findById(user._id)
    .select("-password -refreshToken -phoneNumber -address -location")
/**
 * below error is accure due to missing of await (never for for to add awate while database call) 
 *    TypeError: Converting circular structure to JSON 
 *    --> starting at object with constructor 'MongoClient'   
 *    |     property 's' -> object with constructor 'Object'
 *    |     property 'sessionPool' -> object with constructor 'ServerSessionPool'  
 *    --- property 'client' closes the circle  
 */
    
    const options = {
        httpOnly:true,
        secure:true
    }
    return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
        new ApiResponse(
            200, 
            {
                user: loggedInUser, accessToken, refreshToken
            },
            "User logged In Successfully"
        )
    )
});
const logoutUser = asyncHandler(async(req, res)=>{
    try {
        await User.findByIdAndUpdate(
            req.user._id,
            {
                $unset: {
                    refreshToken: ""
                }
            },
            {
                new:true //
            }
        )  
        const options = {
            httpOnly:true,
            secure:true
        }
        return res
        .status(200, {}, "user loggedOut")
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(new ApiResponse(200, {}, "User logged Out"))
    } catch (error) {
        throw new ApiError(401, "fail to logged out")
    }
});
const refreshAccessToken = asyncHandler(async(req, res)=>{
    try {
        const incomingRefreshToken = await req.cookies.refreshToken || req.body.refreshToken;
        if (!incomingRefreshToken) {
            throw new ApiError(401, "unauthorized request rat")
        }

        const decodedToken = await jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        )
        const user = await User.findById(decodedToken?._id).select("-password -phoneNumber -address -location")
        if (!user) {
            throw new ApiError(401, "Invalid Refresh Token rat")
        }
        if (incomingRefreshToken !== user?.refreshToken) {
            throw new ApiError(401, "Refresh Token is expired rat")
        }
        const options = {
            httpOnly:true,
            secure:true
        }
        const {accessToken, newRefreshToken} = await generateAccessAndRefreshTokens(user._id)
        return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", newRefreshToken, options)
        .json(
            new ApiResponse(
                200,
                {},//accessToken, refreshToken: newRefreshToken
                "Access token refreshed rat"
            )
        )

    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid refresh token rat")
    }
})

const changeCurrentPassword = asyncHandler(async(req, res)=>{
    try {
        const {currentPassword, newPassword} = req.body
        const user = await User.findById(req.user._id)
        const isPassowrdCorrect = await user.isPassowrdCorrect(currentPassword)
        if (!isPassowrdCorrect) {
            throw new ApiError(400, "Current password is invalid")
        }
        user.password = newPassword
        await user.save({validateBeforeSave:false})
        return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                {},
                "password is updated"
            )
        )
    } catch (error) {
        throw new ApiError(401,"can't change the password ccp")
    }
})

const getCurrentUser = asyncHandler(async(req, res)=>{
    return res
    .status(200)
    .json(200, req.user, "current user is fetched successfully")
})

const updateAccountDetails = asyncHandler(async(req, res)=>{
    const {userFullName, email, phoneNumber, address} = req.body
    if (!(userFullName || email || phoneNumber || address)) {
        throw new ApiError(400,"all fields are required uad")
    }
    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                userFullName: userFullName,
                email: email,
                phoneNumber: phoneNumber,// considering not allow user to update phoneNo and email
                address: address
            }
        },
        {new: true}
    ).select(" -password -phoneNumber -location")
    
    return res
    .status(200)
    .json( new ApiResponse(200, user, "Account Details Update Successfully"))
})

const updateProfileImage = asyncHandler(async(req, res)=>{
    const profileImageLocalPath = req.file?.path
    if (!profileImageLocalPath) {
        throw new ApiError(400, "profile image is missing upi")
    }
    
    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                profileImage: profileImage.url
            }
        },
        {new:true}
    ).select(" -password -email -refreshToken -phoneNumber -address -location")
    return res
    .status(200)
    .json(
        new ApiResponse(200, user, "update profile image successfully")
    )
})

export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    changeCurrentPassword,
    getCurrentUser,
    updateAccountDetails,
    updateProfileImage
}