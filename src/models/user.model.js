import mongoose, { Schema } from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const userFullNameSchema = new Schema({
    firstName:{
        type: String,
        require: true,
        lowercase: true,
        trim: true
    },
    middleName:{
        type: String,
        lowercase: true,
        trim: true
    },
    lastName:{
        type: String,
        require: true,
        lowercase: true,
        trim: true
    }
})



const userAddressSchema = new Schema({
    addressLine1:{
        type:String,
        require:true
    },
    addressLine2:{
        type:String
    },
    city:{
        type:String,
        require:true
    },
    state:{
        type:String,
        require:true
    },
    zipCode:{
        type:String,
        require:true
    },
    country:{
        type:String,
        require:true
    },
    location:{
        type:{
            type: String,
            enum:['Point'],
            default:'Point'
        },
        coordinates:{
            type:[Number],
            require:true,
            validate:{
                validator: function (value) {
                    return value.length === 2;
                },
                message: props =>`${props.value} must be an array with two numbers[longitude, latitude].`
            }
        }
    }
});
userAddressSchema.index({location:"2dsphere"});


const userSchema = new Schema({
    userfullName:{
        type:[userFullNameSchema],
        index: true
    },
    username:{
        type:String,
        require: true,
        unique:true,
        lowercase:true,
        trim: true
    },
    email:{
        type:String,
        unique: true,
        lowercase: true,
        trim: true
    },
    phoneNumber:{
        type:String,
        require:true,
        unique:true,
        trim:true,
    },
    password:{
        type:String,
        require:[true, 'Password is required']
    },
    address:{
        type:[userAddressSchema],
        require:true
    },
    cart:{
        type:Schema.Types.ObjectId,
        ref:"Product"
    },
    dob:{
        type:String
    },
    refreshToken:{
        type:String,
    }
},
{
    timestamps:true
})

userSchema.pre("save",async function (next) {
    if(!this.isModified("password")) return next();
    
    this.password = bcrypt.hash(this.password, 10)
    next()
})

userSchema.methods.isPassowrdCorrect = async function (password) {
    await bcrypt.compare(password, this.password)
}
userSchema.methods.generateAccessToken = function () {
    return jwt.sign(
        {
            _id: this._id,
            email: this.email,
            userfullName: this.userfullName,
            username:this.username
        },process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}
userSchema.methods.generateRefreshToken = function () {
    return jwt.sign(
        {
            _id: this._id
        },process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    ) 
}


export const User = mongoose.model("User", userSchema)