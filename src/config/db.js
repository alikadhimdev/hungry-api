import mongoose from "mongoose";

export const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI)
        console.log("db connection success")
    } catch (error) {
        console.log("db connection fail")
        process.exit(1)
    }
}