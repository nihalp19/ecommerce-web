import express from "express"
import dotenv from "dotenv"
dotenv.config()
import authRoutes from "./routes/auth-routes.js"
import { connectDB } from "./db/connect.js"
import cookieParser from "cookie-parser"
import productRoutes from "./routes/product-routes.js"
import cartRoutes from "./routes/cart-route.js"



const app = express()
const PORT = process.env.PORT || 5000

connectDB()

app.use(express.json())
app.use(cookieParser())
app.use("/api/auth", authRoutes)
app.use("/api/products", productRoutes)

app.listen(PORT, () => {
    console.log(`SERVER STARTED AT THE PORT NO ${PORT}`)
})