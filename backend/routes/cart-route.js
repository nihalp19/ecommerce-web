import express from "express"
import { protectRoute } from "../middleware/auth-middleware"
import { addToCart,getCartProducts,removeAllFromCart,updateQuantity } from "../controllers/cart-controllers"

const router = express.Router()


router.get("/",protectRoute,getCartProducts)
router.post("/",protectRoute,addToCart)
router.delete("/",protectRoute,removeAllFromCart)
router.put("/:id",protectRoute,updateQuantity)

export default router