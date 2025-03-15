import mongoose, { Schema } from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const userFullNameSchema = new Schema({
    firstName:{
        type: String,
        required: true,
        lowercase: true,
        trim: true
    },
    middleName:{
        type: String,
        lowercase: true,
        default:"",
        trim: true
    },
    lastName:{
        type: String,
        required: true,
        lowercase: true,
        trim: true
    }
})



const userLocationSchema = new Schema({
    locationPoint:{
        type:{
            type: String,
            enum:['Point'],
            default:'Point'
        },
        coordinates:{
            type:[Number],
            required:true,
            validate:{
                validator: function (value) {
                    return value.length === 2;
                },
                message: props =>`${props.value} must be an array with two numbers[longitude, latitude].`
            },
            default:[0.0,0.0]
        }
    }
});
userLocationSchema.index({location:"2dsphere"});


const userSchema = new Schema({
    userFullName:{
        type:userFullNameSchema,
        required: true,
        index: true
    },
    username:{
        type:String,
        unique:true,
        lowercase:true,
        required:true,
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
        required:true,
        unique:true,
        trim:true,
    },
    password:{
        type:String,
        required:[true, 'Password is requiredd']
    },
    profileImage:{
        type:String
    },
    address:{
        type:[
            {
                addressLine1:{
                    type:String,
                    required:true
                },
                addressLine2:{
                    type:String,
                    default:""
                },
                city:{
                    type:String,
                    required:true
                },
                state:{
                    type:String,
                    required:true
                },
                zipCode:{
                    type:String,
                    required:true
                },
                country:{
                    type:String,
                    required:true
                }
            }
        ],
        required:true
    },
    location:{
        type:userLocationSchema,
        default:{}
    },
    cart:{
        type:Schema.Types.ObjectId,
        ref:"Product"
    },
    dob:{
        type:String,
        default:""
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
    
    this.password = await bcrypt.hash(this.password, 10)
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