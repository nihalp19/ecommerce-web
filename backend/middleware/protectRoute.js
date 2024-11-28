import jwt from "jsonwebtoken"
import dotenv from "dotenv"
import User from "../models/user-model.js"


dotenv.config()

export const protectRoute = async (req, res, next) => {
    try {
        const accessToken = req.cookies.accessToken

        if (!accessToken) {
            return res.status(400).json({ message: "User not authorized token not provided" })
        }
        const decoded = jwt.verify(accessToken, process.env.SECRET_KEY)

        const user = await User.findById(decoded.userId).select("-password")
        if (!user) {
            return res.status(400).json({ message: "User not found" })
        }
        req.user = user
        next()
    } catch (error) {
        console.log("Error protect route", error.message)
        return res.status(500).json({ message: "Internal Server Error" })
    }
}


export const adminRoute = async (req,res,next) => {
    try{
        if(req.user && req.user.roles === "admin"){
            next()
        }else{
            return res.status(400).json({message : "Access : admin only"})
        }
    }catch(error){
        console.log("Error in adminRoute",error.message)
        return res.status(500).json({message : "Internal Server Error"})
    }
}