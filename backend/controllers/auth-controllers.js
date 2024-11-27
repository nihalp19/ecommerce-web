import User from "../models/user-model.js"
import { redis } from "../lib/redis.js"
import { generateToken } from "../lib/generateToken.js"
import dotenv from "dotenv"
import jwt from "jsonwebtoken"

dotenv.config()

const storeRefreshToken = async (userId, refreshToken) => {
    await redis.set(`refresh-token:${userId}`, refreshToken, "EX", 7 * 24 * 60 * 60 * 1000)
}

const setCookies = (res, accessToken, refreshToken) => {
    res.cookie("accessToken", accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 15 * 60 * 1000
    })
    res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000
    })
}

export const signup = async (req, res) => {
    try {
        const { email, name, password } = req.body
        const userExits = await User.findOne({ email })

        if (userExits) {
            return res.status(400).json({ message: "User already exits" })
        }
        const user = await User.create({ name, email, password })
        const { accessToken, refreshToken } = generateToken(user._id)
        await storeRefreshToken(user._id, refreshToken)
        storeRefreshToken(user._id, refreshToken)
        setCookies(res, accessToken, refreshToken)
        res.status(201).json({
            user: {
                ...user._doc,
                password: undefined
            }, message: "User created successfully"
        })
    } catch (error) {
        console.log("error while signup", error.message)
        return res.status(500).json({ message: "Internal Server Error" })
    }
}

export const logout = async (req, res) => {
    try {
        const refreshToken = req.cookies.refreshToken
        if (refreshToken) {
            const decode = jwt.verify(refreshToken, process.env.SECRET_KEY)
            await redis.del(`refresh-token:${decode.userId}`)
        }

        res.clearCookie("refreshToken")
        res.clearCookie("accessToken")
        res.status(200).json({ message: "User logged-out Successfully" })
    } catch (error) {
        console.log("Error while logout", error.message)
        return res.status(500).json({ message: "Internal Server Error" })
    }
}

export const login = async (req, res) => {
    try {
        const { email, password } = req.body
        const user = await User.findOne({ email })

        if (user && (await user.comparePassword(password))) {
            const { accessToken, refreshToken } = generateToken(user._id)
            await storeRefreshToken(user._id, refreshToken)
            setCookies(res, accessToken, refreshToken)

            res.status(200).json({ user: { ...user._doc, password: undefined }, message: "User logined Successfully" })
        }
    } catch (error) {
        console.log("error while login",error.message)
        return res.status(500).json({message : "Internal Server Error"})
    }
}