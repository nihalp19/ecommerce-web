import jwt from "jsonwebtoken"
import User from "../models/user-models.js"

export const protectRoute = async (req, res, next) => {
    try {
        const accessToken = req.cookies.accessToken


        if (!accessToken) {
            return res.status(401).json({ success: false, message: "unauthorized - No access token provided" })
        }

        try {
            const decoded = jwt.verify(accessToken, process.env.SECERET_KEY_ACCESSTOKEN)
            const user = await User.findById(decoded.userId).select("-password")

            if (!user) {
                return res.status(401).json({ success: false, message: "User not Found" })
            }

            req.user = User
            next()
        } catch (error)
        {
            if(error.name === "TokenExpiredError"){
                return res.status(401).json({success : false,message : "Unauthorized - Access token expired"})
            }
        }

    } catch (error) {
        console.log("Error in prorectRoute middleware", error.message)
        return res.status(401).json({ message: "Unauthorized - Invalid access token" })
    }
}

export const adminRoute = (req,res,next) => {
    if(req.user && req.user.role === "admin"){
        next()
    }
    else {
        return res.status(403).json({message : "Unauthorized - Admin only"})
    }
}