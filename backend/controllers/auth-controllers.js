import User from "../models/user-models.js"
import jwt from "jsonwebtoken"
import { redis } from "../db/redis.js"
import dotenv from "dotenv"
dotenv.config()

const generateToken = (userId) => {
    const accessToken = jwt.sign({ userId: userId }, process.env.SECERET_KEY_ACCESSTOKEN, {
        expiresIn: '15m'
    })

    const refreshToken = jwt.sign({ userId: userId }, process.env.SECRET_KEY_REFRESHTOKEN, {
        expiresIn: '7d'
    })

    return { accessToken, refreshToken }
}

const storeRefreshToken = async (userId, refreshToken) => {
    await redis.set(`refresh-token:${userId}`, refreshToken, "EX", 7 * 24 * 60 * 60)
}

const setCookies = (res, accessToken, refreshToken) => {
    res.cookie("accessToken", accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 15 * 60 * 1000,
    })
    res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000,
    })
}


export const signup = async (req, res) => {
    try {
        const { name, email, password } = req.body
        const userExits = await User.findOne({ email })

        if (userExits) {
            return res.status(400).json({ succes: false, message: "User already exits" })
        }

        const user = await User.create({ name, email, password })
        const { accessToken, refreshToken } = generateToken(user._id)
        await storeRefreshToken(user._id, refreshToken)
        setCookies(res, accessToken, refreshToken)

        return res.status(200).json({
            succes: true, message: "User registered successfully", user: {
                ...user._doc,
                password: undefined
            }
        })

    } catch (error) {
        console.log("Error While Registration", error.message)
        return res.status(500).json({ succes: false, message: "Internal Server Error", error: error.message })
    }
}


export const login = async (req, res) => {
    try {
        const { email, password } = req.body
        const user = await User.findOne({ email })
        if (!user) {
            return res.status(400).json({ success: false, message: "Invalid Credentials" })
        }

        if (user && (await user.comparePassword(password))) {
            const { accessToken, refreshToken } = generateToken(user._id)
            await storeRefreshToken(user._id, refreshToken)

            setCookies(res, accessToken, refreshToken)
            return res.status(200).json({
                success: true, message: "User is Logined", user: {
                    ...user._doc,
                    password: undefined
                }
            })
        } else {
            return res.status(400).json({ success: false, message: "Invalid Credentials" })
        }

    } catch (error) {
        console.log("Error While Login", error.message)
        return res.status(500).json({ success: false, message: "Server Internal Error", error: error.message })
    }
}

export const logout = async (req, res) => {
    try {
        const refreshToken = req.cookies.refreshToken
        if (refreshToken) {
            const decoded = jwt.verify(refreshToken, process.env.SECRET_KEY_REFRESHTOKEN)
            await redis.del(`refresh-token:${decoded.userId}`)
        }
        res.clearCookie("accessToken")
        res.clearCookie("refreshToken")
        return res.status(200).json({ success: true, message: "User logout successfully" })
    } catch (error) {
        console.log("Error While Logout", error.message)
        return res.status(500).json({ success: false, message: "Internal Server Error", error: error.message })
    }
}


export const refreshToken = async (req, res) => {
    try {
        const refreshToken = req.cookies.refreshToken
        if (!refreshToken) {
            return res.status(400).json({ success: false, message: "refreshToken is required" })
        }
        const decoded = jwt.verify(refreshToken, process.env.SECRET_KEY_REFRESHTOKEN)
        const storeToken = await redis.get(`refresh-token:${decoded.userId}`)
        console.log("storeToken :", storeToken)
        console.log("refreshToken :", refreshToken)

        if (storeToken !== refreshToken) {
            return res.status(400).json({ success: false, message: "Invalid Token" })
        }

        const accessToken = jwt.sign({ userId: decoded.userId }, process.env.SECERET_KEY_ACCESSTOKEN, {
            expiresIn: "15m"
        })

        res.cookie("accessToken", accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 15 * 60 * 1000
        })

        return res.status(200).json({ success: true, message: "access token is created" })

    } catch (error) {
        console.log("Error While Access-token", error.message)
        return res.status(500).json({ success: false, message: "Internal Server Error", error: error.message })
    }
}
