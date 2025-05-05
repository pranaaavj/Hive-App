import mongoose, { Schema } from "mongoose";

export interface IComment {
    user: mongoose.Types.ObjectId,
    text: string,
    createdAt: Date
}

export const commentSchema = new Schema<IComment>({
    user: {type: Schema.Types.ObjectId, ref: "User", required: true},
    text: {type: String, required: true},
    createdAt: {type: Date, default: Date.now}
}, {_id: false})