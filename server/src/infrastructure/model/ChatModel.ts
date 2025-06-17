import mongoose, {Types,Schema, Document, model} from "mongoose"

export interface IChat extends Document{
    _id: Types.ObjectId;
    members: Types.ObjectId[];
    createdAt?: Date;
    updatedAt?: Date;
  }
  

const chatSchema = new Schema<IChat>(
    {
        members: [{
            type: Types.ObjectId,
            ref: "User",
            required: true

        }]
    },
    {timestamps: true}
)

export const ChatModel = model<IChat>("Chat", chatSchema)