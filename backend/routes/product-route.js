import express from "express"
import {getAllProducts,getAllfeaturedProducts,createProduct,deleteProduct,getProductsByCategory,getRecommendedProducts,toggleFeaturedProduct} from "../controllers/product-controllers.js"
import { protectRoute, adminRoute } from "../middleware/protectRoute.js"
const router = express.Router()
 
router.get("/", protectRoute, adminRoute, getAllProducts)
router.get("/featured",getAllfeaturedProducts)
router.get("/recommendation",getRecommendedProducts)
router.get("/category/:category",getProductsByCategory)
router.post("/",protectRoute,adminRoute,createProduct)
router.patch("/:id",protectRoute,adminRoute,toggleFeaturedProduct)
router.delete("/:id",protectRoute,adminRoute,deleteProduct)
export default router
