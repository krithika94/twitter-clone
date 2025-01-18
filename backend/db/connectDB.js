import mongoose from 'mongoose';
const connectDB = async()=>{
    try{
        await mongoose.connect(process.env.MONGO_URL);
        console.log('Database connected successfully')

    }catch(err){
        console.log(`Database connection error: ${err}`)
        process.exit(1);
    }
}
export default connectDB;