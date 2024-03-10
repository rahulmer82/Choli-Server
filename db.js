import mongoose from "mongoose";
import dotenv from "dotenv"
dotenv.config()

const Appconect=async()=>{
    try {
        const conection=await mongoose.connect(process.env.MONGODB_URL)
        if(conection){console.log("Conection SuccessFully conected")}
    } catch (error) {
        console.log("data conection problem",error)
    }
}

export default Appconect