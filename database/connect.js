import mongoose, { mongo } from "mongoose";
mongoose.set('strictQuery',true);

export const connectDB = async (uri) => {
    try {
        await mongoose.connect(uri);
        console.log("Database connected successfully..!")
    } catch (error) {
        console.log(error)
    }
}