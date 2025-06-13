import {model, Schema, Types} from "mongoose"

export interface    IMessage extends Document {
    _id: Types.ObjectId;
    chatId: Types.ObjectId;
    sender: Types.ObjectId;
    text: string;
    isSeen: boolean;
    createdAt?: Date;
    updatedAt?: Date;
  }

  export interface IFormattedMessage {
  messageId: string;
  text: string;
  isSeen: boolean;
  createdAt: Date;
}

export interface PaginatedMessages{
    messages: IFormattedMessage[],
    page:number,
    limit:number,
    hasMore:boolean
}

const messageSchema = new Schema<IMessage> (
    {
        chatId: {
            type: Schema.Types.ObjectId,
            ref: "Chat",
            required: true
        },
        sender:{
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        text: {
            type: String,
            required: true
        },
        isSeen: {
            type: Boolean,
            default: false
        }
    }, {timestamps: true}
)

export const MessageModel = model<IMessage>("Message", messageSchema)
