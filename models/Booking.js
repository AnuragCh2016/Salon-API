import mongoose from "mongoose";
import { Business } from "./Business.js";
const { Schema } = mongoose;

const bookingSchema = new Schema({
  business: {
    type: Schema.ObjectId,
    ref: "Business",
    required: true,
  },
  service: {
    type: String,
    required: true,
  },
  date: {
    type: String,
    required: true,
  },
  time: {
    type: String,
    required: true,
  },
  customer: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true,
  },
});

export const Booking = mongoose.model("Booking", bookingSchema);
