import express from "express"
import { getAllProducts ,getFeaturedProducts,createProduct,deleteProduct,getRecommendedProduct,getProductsCategory,toggleFeaturedProduct} from "../controllers/product-controllers.js"
import {protectRoute,adminRoute,} from "../middleware/auth-middleware.js"

const router = express.Router()

router.get("/",protectRoute,adminRoute,getAllProducts)
router.get("/featured",getFeaturedProducts)
router.get("/category/:category",getProductsCategory)
router.get("/recommendations",getRecommendedProduct)
router.get("/",protectRoute,adminRoute,createProduct)
router.patch("/:id",protectRoute,adminRoute,toggleFeaturedProduct)
router.get("/:id",protectRoute,adminRoute,deleteProduct)



export default router
