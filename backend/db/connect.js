import mongoose from "mongoose"

export const connectDB = async () => {
    try{
        await mongoose.connect(process.env.MONGODB_URI)
        console.log("MONGODB CONNECTED")
    }catch(error){
        console.log("Error while connecting",error)
    }
}

