import express from "express"
import { signup,logout,login,refreshToken} from "../controllers/auth-controllers.js"


const router = express.Router()

router.post("/signup",signup)
router.post("/login",login)
router.post("/logout",logout)
router.post("/refresh-token",refreshToken)

export default router