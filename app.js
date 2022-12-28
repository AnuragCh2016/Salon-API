//dotenv
import dotenv from 'dotenv'
dotenv.config()

//all imports
import express from 'express'
import { connectDB } from './database/connect.js';
import businessRoute from './routes/businessRoute.js';
import bookingRoute from './routes/bookingRoute.js'

//all consts
const port = process.env.port || 3000;
const uri = process.env.mongo_uri;
const app = express();

//all middleware
app.use(express.json());

//use routes
app.use('/api/businesses',businessRoute);
app.use('/api/booking',bookingRoute);

//connect to the database here -
connectDB(uri);

app.listen(port, () => {
    console.log(`Server started on port: ${port}`)
})