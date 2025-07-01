export interface ApiMessage {
  messageId: string;
  text: string;
  isSeen: boolean;
  createdAt: string;
  profilePic: string;
  username: string;
  senderId?: string;
  type: string;
}

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: Date;
  isRead: boolean;
}