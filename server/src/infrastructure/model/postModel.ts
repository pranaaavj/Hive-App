import mongoose, {Schema, Document} from "mongoose";
import { IComment, commentSchema } from "./commentModel";

export interface IPostModel extends Document {
    userId: mongoose.Types.ObjectId;
    content: string,
    image?: string[],
    likes: mongoose.Types.ObjectId[],
    comments: IComment[],
    createdAt:Date,
    updatedAt: Date
}

const postSchema = new Schema<IPostModel>(
    {
        userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
        content: { type: String, required: true },
        image: { type: [String], default: [] },
        likes: [{ type: Schema.Types.ObjectId, ref: "User", default: [] }],
        comments: {type: [commentSchema], default: []}
      },
      { timestamps: true }
)

export const Post = mongoose.model<IPostModel>("Post", postSchema)