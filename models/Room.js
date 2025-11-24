// models/Room.js
import mongoose from "mongoose";

const { Schema } = mongoose;

const roomSchema = new Schema(
    {
        hotel: {
            type: Schema.Types.ObjectId,
            ref: "Hotel",
            required: true,
        },

        name: {
            type: String,
            required: true,
            trim: true,
        },

        type: {
            type: String,
            required: true,
            trim: true,
        },

        price: {
            type: Number,
            required: true,
            min: 0,
        },

        capacity: {
            type: Number,
            required: true,
            min: 1,
        },

        inventory: {
            type: Number,
            required: true,
            min: 0,
        },

        images: [
            {
                type: String,
                trim: true,
            },
        ],

        amenities: [
            {
                type: String,
                trim: true,
            },
        ],

        status: {
            type: String,
            enum: ["active", "inactive"],
            default: "active",
        },
    },
    {
        timestamps: true,
    }
);

const Room = mongoose.model("Room", roomSchema);
export default Room;
