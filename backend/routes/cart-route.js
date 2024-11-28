import express from "express"
import { protectRoute, adminRoute } from "../middleware/protectRoute.js"
import {addToCart,getCartProducts,removeAllFromCart,updateQuantity} from "../controllers/cart-controllers.js"
const router = express.Router()


router.post("/",protectRoute,addToCart)
router.get("/",protectRoute,getCartProducts)
router.delete("/",protectRoute,removeAllFromCart)
router.put(":/id",protectRoute,updateQuantity)
