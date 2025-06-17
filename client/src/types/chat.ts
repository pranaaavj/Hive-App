export interface ChatPreview {
    _id: string,
    otherUser: {
        _id:string,
        username:string,
        profilePic: string,
        isOnline: boolean

    },
    lastMessage: {
        _id: string;
        chatId: string;
        sender: string;
        text: string;
        isSeen: boolean;
        createdAt: string;
        updatedAt: string;
        __v: number;
      };
      updatedAt: string;
    
}