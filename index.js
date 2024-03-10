import express from "express";
import Appconect from "./db.js";
import dotenv from  'dotenv';
import cors from "cors"
dotenv.config()
const app=express()

app.use(express.json())

let prmition={
    origin:process.env.HOST_URL 
}

Appconect()

app.use(cors(prmition))

// app.use(cors(process.env.ORIGIN))

import route from "./Rotes/ProductRoutes.js";
import user from "./Rotes/BookingRoutes.js";


const port=process.env.PORT ||5000

app.use('/api',route)
app.use('/api',user)
app.listen(port,()=>{console.log(`app is running in port ${port}`)})