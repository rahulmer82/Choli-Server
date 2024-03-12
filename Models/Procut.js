import mongoose from "mongoose";
import { Schema } from "mongoose";

const ProductSchema= new Schema({
    productID:{
        type:Number,
        required:true,
        unique: true

    },
    name:{
        type:String,
        default:null
    },
    image:{
        type:String,
        default:""
    },
    rent:{
        type:Number,
        required:true
    },
    owner:{
        type:String,
        default:"Milan"
    },
    bookingDate:{
        type:Array,
        default:[]
    }

},{timestamps:true})

export const Product=mongoose.model("Product",ProductSchema)