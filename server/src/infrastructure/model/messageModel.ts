import {model, Schema, Types} from "mongoose"

export interface    IMessage extends Document {
    _id: Types.ObjectId;
    chatId: Types.ObjectId;
    sender: Types.ObjectId;
    text: string;
    isSeen: boolean;
    type: "message" | "audio"
    createdAt?: Date;
    updatedAt?: Date;
  }

  export interface IPopulatedMessage extends Omit<IMessage, 'sender'> {
    _id: Types.ObjectId;
    chatId: Types.ObjectId;
    sender: {
        _id: Types.ObjectId;
        profilePicture?: string;
    };
    text: string;
    isSeen: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}
  export interface IFormattedMessage {
  messageId: string;
  senderId: Types.ObjectId,
  text: string;
  isSeen: boolean;
  type: string,
  profilePic?: {profilePicture: string},
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
        },
        type: {
            type: String,
            enum: ['audio', 'message'],
            required: true
        }
    }, {timestamps: true}
)

export const MessageModel = model<IMessage>("Message", messageSchema)
