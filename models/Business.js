import mongoose from "mongoose";
const { Schema } = mongoose;

const businessSchema = new Schema({
  companyName: {
    type: String,
    required: true,
  },
  gstin: {
    type: String,
    required: true,
  },
  panNumber: {
    type: String,
    required: true,
  },
  address: {
    type: String,
    required: true,
  },
  workSchedule: [
    {
      day: {
        type: String,
        required: true,
      },
      startTime: {
        type: String,
        required: true,
      },
      endTime: {
        type: String,
        required: true,
      },
    },
  ],
  services: [
    {
      name: {
        type: String,
        required: true,
      },
      duration: {
        type: Number,
        required: true,
      },
      cost: {
        type: Number,
        required: true,
      },
    },
  ],
  chairs: {
    type: Number,
    required: true,
  },
});

export const Business = mongoose.model("Business", businessSchema);

