import {v2 as cloundinary} from "cloudinary"
import dotenv from "dotenv"

dotenv.config()

cloundinary.config({
    cloud_name : process.env.CLOUDINARY_CLOUD_NAME,
    api_key : process.env.CLOUDINARY_API_KEY,
    api_secret : process.env.CLOUDINARY_API_SECRET
})

export default cloundinary