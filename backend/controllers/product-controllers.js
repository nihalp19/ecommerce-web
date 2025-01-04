import Product from '../models/product-models.js'
import { redis } from '../db/redis.js'
import cloudinary from '../lib/cloudinary.js'

export const getAllProducts = async (req, res) => {
    try {
        const products = await Product.find({})
        if (!products) {
            return res.status(400).json({ success: false, message: "NO Products" })
        }
        return res.status(200).json({ success: true, message: "All products are fetched", products: products })
    } catch (error) {
        console.log("Error in getAllProducts controller", error.message)
        return res.status(500).json({ success: false, message: "Internal Server Error", error: error.message })
    }
}

export const getFeaturedProducts = async () => {
    try {
        let featuredProducts = await redis.get("featured_products")
        if (featuredProducts) {
            return res.status(200).json({ success: true, featuredProducts: JSON.parse(featuredProducts) })
        }

        featuredProducts = await Product.find({ isFeatured: true }).lean()

        if (!featuredProducts) {
            return res.status(404).json({ message: "No featured products found" })
        }


        await redis.set("featured_products", JSON.stringify(featuredProducts))

        return res.status(200).json({ success: true, featuredProducts: featuredProducts })
    } catch (error) {
        console.log("Error in getFeatured Controller", error.message)
        return res.status(500).json({ success: false, message: "Internal Server Error", error: error.message })
    }
}

export const createProduct = async (req, res) => {
    try {
        const { name, description, price, image, category } = req.body

        let cloudinaryResponse = null
        if (image) {
            cloudinaryResponse = await cloudinary.uploader.upload(image)
        }
        const product = await Product.create({
            name,
            description,
            price,
            image: cloudinaryResponse.secure_url ? cloudinaryResponse.secure_url : "",
            category,
        })

        return res.status(200).json({ success: true, message: "Product is created", product: product })
    } catch (error) {
        console.log("Error while createProduct", error.message)
        return res.status(500).json({ success: false, message: "Internal Server Error", error: error.message })
    }
}

export const deleteProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id)

        if (!product) {
            return res.status(404).json({ success: false, message: "Product not found" })
        }

        if (product.image) {
            const publicId = product.image.split("/").pop().split(".")[0]
            try {
                await cloudinary.uploader.destroy(`products/${publicId}`)
                console.log("deleted image from cloudinary")
            } catch (error) {
                console.log("error deleting image from cloudinary", error)
            }
        }

        await Product.findByIdAndDelete(req.params.id)
        return res.status(200).json({ success: true, message: "Product deleted successfully" })
    } catch (error) {
        console.log("Error in deleteProduct", error.message)
        return res.status(500).json({ success: false })
    }
}

export const getRecommendedProduct = async (req, res) => {
    try {
        const products = await Product.aggregate([{
            $sample: { size: 3 }
        }, {
            $project : {
                _id : 1,
                name : 1,
                description : 1,
                image : 1,
                price : 1
            }
        }])

        return res.status(200).json({success : true,message : "Recommended Product found",products : products})
    } catch (error) {
        console.log("Error in getRecommendedProducts controller",error.message)
        return res.status(500).json({success : false,message : "Internal Server Error",error : error.message})
    }
}


export const getProductsCategory = async(req,res) => {
    try{
        const {category} = req.params
        const products = await Product.find({category})

        return res.status(200).json({success : false,message : "Products my category found",category : category})
    }catch(error){
        console.log("Error is getProductByCategory controller",error.message)
        return res.status(500).json({success : false,messae : "Internal Server Error",error : error.message})
    }
}

export const toggleFeaturedProduct= async(req,res) => {
    try {
        const product = await Product.findById(req.params.id)
        if(product){
            product.isFeatured = !product.isFeatured
            const updatedProduct = await product.save()
            await updateFeaturedProductsCache()
            return res.status(200).json({success : true, message : "Featured toggle",updatedProduct : updatedProduct})
        }
        else{
            return res.status(404).json({mesage : "Product not found"})
        }
    } catch (error) {
        console.log("Error in toggleFeatureProduct controller",error.message)
        return res.status(500).json({success : false,message : "Internal Server Error",error : error.message})
    }
}


async function updateFeaturedProductsCache(){
    try {
        const featuredProducts = await Product.find({isFeatured : true}).lean()

        await redis.set("featured_products",JSON.stringify(featuredProducts))
    } catch (error) {
        console.log("Error is update cache function")
    }
}