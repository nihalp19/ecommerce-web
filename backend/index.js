import express from "express";
import authRoutes from "./routes/auth-route.js"
import {connectDB} from "./lib/db.js"
import cookieParser from "cookie-parser";
import dotenv from "dotenv"


dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000
app.use(express.json())
app.use(cookieParser())

app.use("/api/auth", authRoutes)
app.listen(PORT, () => {
    console.log(`SERVER STARTED AT THE PORT NO ${PORT}`)
    connectDB()
})
