import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express()

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}))

app.use(express.json({ limit: '16kb' }))//limit the import of json data
app.use(express.urlencoded({ extended: true, limit: '16kb' }))//when search url encoder change 'space' into '%20' and more so on
app.use(express.static("public"))//file folder image store, 'public asset'

app.use(cookieParser())


import userRouter from "./routes/user.routes.js"
app.use("/api/v1/users", userRouter)

import productRoute from "./routes/product.routes.js"
app.use("/api/v1/products", productRoute);




export { app }