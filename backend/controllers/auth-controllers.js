import User from "../models/user-models.js"
export const signup = async(req,res) => {
    try{
        const {name,email,password} = req.body
        const userExits = await User.findOne({email})

        if(userExits){
            return res.status(400).json({succes : false,message : "User already exits"})
        }

        const user = await User.create({name,email,password})
        return res.status(200).json({succes : true,message : "User registered successfully",user : {
            ...user._doc,
            password : undefined
        }})

    }catch(error){
        console.log("Error While Registration",error.message)
        return res.status(500).json({succes : false,message : "Internal Server Error",error : error.message})
    }
}


export const login = async() => {

}
export const logout = async() => {

}
