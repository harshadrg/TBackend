import { asyncHandler } from "../utils/asyncHandler.js";
import { Product } from "../models/product.model.js";
import { Plant } from "../models/plant.model.js";
import { Seed } from "../models/seed.model.js";
import { uploadOnCloudinaryP } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";

const registerProduct = asyncHandler(async (req, res) => {
    const { name, seller, description, price, discount, category, sku,
        seedType, stock, germinationTime,
        plantType, lightNeed,
        waterNeed, growthZone, detailDescription, maintenanceGuide, season, tags } = req.body;
    const commonName = name["commonName"];
    const scientificName = name["scientificName"];
    // console.log(commonName, scientificName);

    if (
        [commonName, scientificName, seller, description, price.toString(), discount.toString(), category].some((field) =>
            field?.trim() === "")
    ) {
        throw new ApiError(400, "All fields are required")
    }
    // console.log(Object.values(name).join(","), seller, description, price.toString(), discount.toString(), category, images.join(","))

    // const existedProduct = await Product.findOne({
    //     $or: [{ sku }]
    // })
    // if (existedProduct) {
    //     throw new ApiError(409, "proudict with sku is already existed")
    // }

    let productImage;
    if (req.files && Array.isArray(req.files.productImages) && req.files.productImages.length > 0) {
        const imageToUpload = req.files?.productImages.slice(0, 4);
        const allImageFilePath = await imageToUpload.map(file => {
            const imageFilePath = file?.path;
            if (imageFilePath) {
                return uploadOnCloudinaryP(imageFilePath)
            } else {
                return Promise.resolve(null)
            }
        });
        const productImageLocalPath = await Promise.all(allImageFilePath);
        productImage = productImageLocalPath.filter(result => result !== null);
    }

    const product = await Product.create({
        name,
        productImages: productImage?.url,
        seller,
        description,
        price,
        discount,
        category,
        stock,
        sku,
        seedType, germinationTime,
        plantType, lightNeed,
        waterNeed, growthZone, detailDescription, maintenanceGuide, season, tags
    })
    if (!product) {
        throw new ApiError(500, "something went wrong when registering user")
    }
    return res.status(201).json(
        new ApiResponse(200, product, "User Registered Successfully")
    )
})
export { registerProduct }