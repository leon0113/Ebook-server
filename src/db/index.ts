import mongoose from "mongoose";
import 'dotenv/config'

const uri = process.env.MONGODB_URI;

if (!uri) {
    throw new Error("Please define the MONGODB_URI environment variable inside .env file");
}

export const dbConnect = () => {
    mongoose.connect(uri).then(() => {
        console.log("Connected to Database successfully!");
    }).catch((err) => {
        console.log("Database connection failed", err.message);
    });
}