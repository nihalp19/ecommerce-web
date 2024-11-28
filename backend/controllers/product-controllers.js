import Product from "../models/product-model.js"
import { redis } from "../lib/redis.js"
import cloundinary from "../lib/cloundinary.js"
export const getAllProducts = async (req, res) => {
    try {
        const products = await Product.find({})
        res.json({ products })
    } catch (error) {
        console.log("error in getAllProducts", error.message)
        return res.status(500).json({ message: "Server Internal Error" })
    }
}

export const getAllfeaturedProducts = async (req, res) => {
    try {
        let featuredProducts = await redis.get("Featured_products")
        if (featuredProducts) {
            return res.json(JSON.parse(featuredProducts))
        }
        featuredProducts = await Product.find({ isFeatured: true })
        if (!featuredProducts) {
            return res.status(400).json({ message: "No featured Product found" })
        }

        await redis.set("featured_products", featuredProducts)
        res.status(200).json({ featuredProducts, message: "sucessfully fetched featuredProducts" })
    } catch (error) {
        console.log("Error in getAllfeaturedProducts", error.message)
        return res.status(500).json({ message: "Server Internal Error" })
    }
}

export const createProduct = async (req, res) => {
    try {
        const { name, description, price, image, category } = req.body;
        let cloudinaryResponse = null

        if (image) {
            await cloundinary.uploader.upload(image, { folder: "products" })
        }


        const product = await Product.create({
            name,
            description,
            price,
            image,
            image: cloudinaryResponse.secure_url ? cloudinaryResponse.secure_url : "",
            category,
        })

        res.status(201).json(product)
    } catch (error) {
        console.log("Error in createProduct controller", error.message)
        res.status(500).json({ message: "Server error", error: error.message })
    }
}

export const deleteProduct = async (req, res) => {
    try {
        const productid = req.params.id
        if (!productid) {
            return res.status(400).json({ message: "Product id not found" })
        }
        const product = await Product.findById(productid)

        if(!product){
            return res.status(400).json({message : "Product not found"})
        }


        if(product.image){
            const publicId = product.image.split("/").pop().split(".")[0]
            try {
                await cloundinary.uploader.destroy(`products/${publicId}`)
                console.log("deleted image from cloudinary")
            } catch (error) {
                console.log("error deleting imnage from cloudinary",error)
            }
        }
        await Product.findByIdAndDelete(productid)
        res.json({message : "Product deleted successfully"})
    } catch (error) {
        console.log("Error while deleting product", error.message)
        return res.status(500).json({ message: "Internal Server Error" })
    }
}

export const getRecommendedProducts = async (req, res) => {
    try {
        const products = await Product.aggregate([
            { $sample: { size: 3 } },
            {
                $project: {
                    _id: 1,
                    name: 1,
                    description: 1,
                    image: 1,
                    price: 1
                }
            }
        ])
        res.json(products)
    } catch (error) {
        console.log("Error in getRecommded controller",error.message)
        res.status(500).json({message : "Internal Server error"})
    }
}

export const getProductsByCategory = async (req,res) => {
      const {category} = req.params
      try{
        const products = await Product.find({category});
        res.json(products)
      } catch(error){
        console.log("Error in getProductsByCategory controller",error.message)
        res.status(500).json({message : "Server error",error : error.message})
      }
}

async function updateFeaturedProductsCache(){
    try{
        const featuredProducts = await Product.find({isFeatured : true}).lean()
        await redis.set("featured_products",JSON.stringify(featuredProducts))
    }catch(error){
        console.log("error in update cache function")
    }
}

export const toggleFeaturedProduct = async (req,res) => {
    const productid  = req.params.id
    try{
        const product = await Product.findById(productid)
        if(product){
            product.isFeatured = !product.isFeatured
            const updatedProduct = await product.save()
            await updateFeaturedProductsCache()
            res.json(updatedProduct) 
        }
        else{
            res.status(400).json({message : "Product not found"})
        }
    }catch(error){
        console.log("Error in toggleFeaturedProduct controller",error.message)
        res.status(500).json({message : "Server error",error : error.message})
    }
}