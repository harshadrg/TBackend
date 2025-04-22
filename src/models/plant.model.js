import { Schema } from "mongoose";
import { Product } from "./product.model.js";

const plantSchema = new Schema({
    plantType: {
        type: String,
        required: true,
        trim: true
    },
    lightNeed: {
        type: String,
        required: true
    },
    waterNeed: {
        type: String,
        required: true
    },
    growthZone: {
        type: String,
        required: true
    },
    detailDescription: {
        type: String,
        required: true
    },
    maintenanceGuide: {
        type: String
    },
    season: {
        type: String,
        required: true
    },
    tags: {
        type: [String],
        required: true,
    }
});

export const Plant = Product.discriminator("Plant", plantSchema);
// export const Plant = mongoose.model("Plant", plantSchema)
