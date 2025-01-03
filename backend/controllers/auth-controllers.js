import User from "../models/user-models.js"
import jwt from "jsonwebtoken"
import {redis} from "../db/redis.js"
import dotenv from "dotenv"
dotenv.config()

const generateToken = (res,userId) => {
    const accessToken = jwt.sign({userId},process.env.SECERET_KEY_ACCESSTOKEN,{
        expiresIn : '15m'
    }) 

    const refreshToken = jwt.sign({userId},process.env.SECRET_KEY_REFRESHTOKEN,{
        expiresIn : '7d'
    })

    return {accessToken,refreshToken}
}

const  storeRefreshToken= async(userId,refreshToken) => {
    await redis.set(`refresh-token${userId}`,refreshToken,"EX",7*24*60*60)
}

const setCookies = (res,accessToken,refreshToken) => {
    res.cookie("accessToken",accessToken,{
        httpOnly : true,
        secure : process.env.NODE_ENV === "production",
        sameSite : "strict",
        maxAge: 15 * 60 * 1000,
    })
    res.cookie("refreshToken",refreshToken,{
        httpOnly : true,
        secure : process.env.NODE_ENV === "production",
        sameSite : "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000,
    })
}


export const signup = async(req,res) => {
    try{
        const {name,email,password} = req.body
        const userExits = await User.findOne({email})

        if(userExits){
            return res.status(400).json({succes : false,message : "User already exits"})
        }

        const user = await User.create({name,email,password})
        const {accessToken,refreshToken} = generateToken(user._id)
        await storeRefreshToken(user._id,refreshToken)

       setCookies(res,accessToken,refreshToken)

        return res.status(200).json({succes : true,message : "User registered successfully",user : {
            ...user._doc,
            password : undefined
        }})

    }catch(error){
        console.log("Error While Registration",error.message)
        return res.status(500).json({succes : false,message : "Internal Server Error",error : error.message})
    }
}


export const login = async() => {

}
export const logout = async() => {

}
