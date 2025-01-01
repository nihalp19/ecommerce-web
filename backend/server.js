import express from "express"
import dotenv from "dotenv"
dotenv.config()
import authRoutes from "./routes/auth-routes.js"
import { connectDB } from "./db/connect.js"

const app = express()
const PORT = process.env.PORT || 5000

connectDB()

app.use(express.json())
app.use("/api/auth",authRoutes)

app.listen(PORT,() => {
    console.log(`SERVER STARTED AT THE PORT NO ${PORT}`)
})