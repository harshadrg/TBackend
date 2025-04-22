import { Plant } from "../models/plant.model.js";
import { Seed } from "../models/seed.model.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const checkCategory = asyncHandler(async (req, res, next) => {
    try {
        const { category } = req.body;
        const getCategory = await category;
        // Ensure category exists and normalize it (e.g., to lowercase) if desired.
        if (!getCategory) {
            throw new ApiError(400, "Missing product category");
        }
        const currentCategory = await getCategory
        let ProductModel;

        // Based on the normalized category value, attach the proper model to the request.
        switch (currentCategory) {
            case "Seed":
                ProductModel = Seed;
                break;
            case "Plant":
                ProductModel = Plant;
                break;
            // case "tool":
            //   req.ProductModel = Tool;
            //   break;
            default:
                throw new ApiError(400, "Invalid or unsupported category");
        }
        req.ProductModel = ProductModel
        req.ProductData = { ...req.body }
        // Continue to the route handler if the category is valid.
        next();

    } catch (error) {
        throw new ApiError(401, error?.message || "select the valid category")
    }
})