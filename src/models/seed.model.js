import { Schema } from "mongoose";
import { Product } from "./product.model.js";

const seedSchema = new Schema({
    seedType: {
        type: String,
        required: true,
        trim: true
    },
    germinationTime: {
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
        type: String,
        required: true
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

export const Seed = Product.discriminator("Seed", seedSchema);
// export const Seed = mongoose.model("Seed", seedSchema)
