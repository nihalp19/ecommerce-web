import Product from "../models/product-models"

export const getCartProducts = async (req,res) => {
    try {
        const products = await Product.find({_id : {$in:req.user.cartItems}})

        const cartItems = products.map(product => {
            const item = req.user.cartItems.find(cartItems.id === productId)
            return {...product.toJSON(),quantity : item.quantity}
        })
        return res.status(200).json({success : true,message : "All cartProducts fetched",cartItems : cartItems})
    } catch (error) {
        console.log("Error in getCartProducts controller",error.message)
        return res.status(500).json({success : false,message : "Internal Server Error",error : error.message})
    }
}


export const addToCart = async (req,res) => {
    try{
        const {productId} = req.body
        const user = req.user

        const existingItem = user.cartItems.find(item => item.id === productId)
        if(existingItem){
            existingItem.quantity += 1
        }else{
            user.cartItems.push(productId)
        }
        await user.save()
        return res.status(200).json({success : true,message : "Item Added to Cart",cartItems : user.cartItems})
    }catch(error){
        console.log("Error in addToCart controller",error.message)
        return res.status(500).json({message : "Internal Server Error",error : error.message})
    }
}

export const removeAllFromCart = async(req,res) => {
    try{
        const {productId} = req.body
        const user = req.user
        if(!productId){
            user.cartItems = [];
        }else{
            user.cartItems = user.cartItems.filter((item) => item.id !== productId)
        }
        await user.save()
        return res.status(200).json({success : true,message : "All items are removed from cart",cartItems : user.cartItems})
    }catch(error){
        console.log("Error while RemoveingfromCart Controller",error.message)
        return res.status(500).json({success : false,message : "Internal Server Error",error : error.message})
    }
}

export const updateQuantity = async (req,res) => {
    try{
        const {id:productId} = req.params 
        const {quantity} = req.body

        const user = req.user
        const existingItem = user.cartItems.find((item) => item.id === productId)

        if(existingItem){
            if(quantity === 0){
                user.cartItems = user.cartItems.filter((item) => item.id === productId)

                await user.save()
                return res.status(200).json({success : true,message : "cartItems quantity updated",cartItems : user.cartItems})
            }

            existingItem.quantity = quantity
            await user.save()
            return res.status(200).json({success : true,message : "cartItems quantity updated",cartItems : user.cartItems})
        }else{
            return res.status(404).json({success : false,message : "Product not found"})
        }
    }catch(error){
        console.log("Error while updating quantity",error.message)
        return res.status(500).json({success : false,message : "Server Error",error: error.message})
    }
}