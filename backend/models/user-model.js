import mongoose from "mongoose"
import bcryptjs from "bcryptjs"
const userSchema = new mongoose.Schema({
    name : {
        type : String,
        required : [true,"Name is required"]
    },email : {
        type : String,
        unique  : true,
        required : [true,"Email is required"],
        lowercase : true,
        trim: true
    },
    password : {
        type : String,
        required : [true,"Email is required"],
        minlength : [6,"Password must be at least 6 characters long"]
    },
    cartItems : [
        {
            quantity : {
                type : Number,
                default: 1
            },product : {
                type : mongoose.Schema.Types.ObjectId,
                ref : "Product"
            }
        }
    ],
    roles : {
        type : String,
        enum : ['customer','admin'],
        default : 'customer'
    }
},{timestamps : true})


userSchema.pre("save",async function (next){
    if(!this.isModified("password")) return next()

    try{
        const salt = await bcryptjs.genSalt(10)
        this.password = await bcryptjs.hash(this.password,salt)
        next()
    }catch(error){
        next(error)
    }
})

userSchema.methods.comparePassword = async function (password){
    return bcryptjs.compare(password,this.password)
}

const User = mongoose.model("User",userSchema)

export default User