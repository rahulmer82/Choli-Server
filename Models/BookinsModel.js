import mongoose from "mongoose";
import { Schema } from "mongoose";

const BookingSchema=new Schema({
    productId:{
        type:Schema.Types.ObjectId,
        ref:"Product"
    },
    name:{
        type:String,
        required:true
    },
    mobile:{
        type:Number,
        required:true
    },
    BookID:{
        type:Number,
        required:true

    },
    rent:{
        type:Number,
        required:true
    },
    productName:{
        type:String,
        default:null
    },
    date:{
        type:String,
        default: null
    }

},{timestamps:true})

export const Booking=mongoose.model("Booking",BookingSchema)