import mongoose, { Schema } from "mongoose";

const productName = new mongoose.Schema({
    commonName: {
        type: String,
        required: true,
        trim: true
    },
    scientificName: {
        type: String,
        required: true,
        trim: true
    }
}, { _id: false });

const productSchema = new Schema({
    name: {
        type: productName,
        required: true
    },
    seller: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true,
        min: 0
    },
    discount: {
        type: Number,
        default: 0,
        min: 0,
        max: 99
    },
    category: {
        type: String,
        enum: ["plant", "seed", "tool"],
        required: true
    },
    stock: {
        type: Number,
        required: true,
        default: 0,
        min: 0
    },
    sku: {
        type: String,
        // unique: true,
        required: true,
        trim: true,
        default: null
    },
    images: [{
        type: String
    }],
},
    {
        discriminatorKey: "category", // This key is used to differentiate the model type
        collection: "products" // All documents will be saved in the "products" collection //explicitely naming the collection in mongodb
    }
)

export const Product = mongoose.model("Product", productSchema)