"use client";

import { useEffect, useState, useRef, use } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Send,
  Phone,
  Video,
  MoreVertical,
  Search,
  ArrowLeft,
  X,
} from "lucide-react";
import { AiOutlineAudio } from "react-icons/ai";
import { MdDelete } from "react-icons/md";
import { IoMdSend } from "react-icons/io";
import { useGetChatsQuery } from "@/services/chatApi";
import { ChatPreview } from "@/types/chat";
import { useOnlineUsers } from "@/hooks/useOnlineUsers";
import {
  useLazyGetMessagesQuery,
  useSendMessageMutation,
} from "@/services/chatApi";
import { UseSelector } from "react-redux";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store/store";
// ADDED: Import socket configuration
import { socket } from "../../lib/socket";
import { uploadAudioToCloudinary } from "@/utils/cloudinary";

// TypeScript interfaces
interface User {
  id: string;
  name: string;
  username: string;
  avatar: string;
  isOnline: boolean;
  lastSeen?: string;
  bio?: string;
  followers?: number;
  following?: number;
}

interface ApiMessage {
  messageId: string;
  text: string;
  isSeen: boolean;
  createdAt: string;
  profilePic: string;
  senderId?: string;
  type: string;
}

interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: Date;
  isRead: boolean;
}

interface Chat {
  id: string;
  user: User;
  lastMessage: Message;
  unreadCount: number;
}

// ADDED: Interface for real-time message
interface SocketMessage {
  chatId: string;
  senderId: string;
  profilePic?: string;
  text: string;
  type:string
  createdAt: string;
}

export default function MessagesPage() {
  const [selectedChat, setSelectedChat] = useState<ChatPreview | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [showUserDetails, setShowUserDetails] = useState(false);
  const currentUser = useSelector((state: RootState) => state.user.user);
  // ADDED: State to store real-time messages
  const [realtimeMessages, setRealtimeMessages] = useState<ApiMessage[]>([]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const { data: userChats, isLoading } = useGetChatsQuery(undefined);
  const { onlineUsers } = useOnlineUsers();
  const [getMessages, { data: userMessages, isLoading: messagesLoading }] =
    useLazyGetMessagesQuery();
  const currentUserId = useSelector((state: RootState) => state.user.user?.id);
  const [sendMessage] = useSendMessageMutation();
  const [isTyping, setIsTyping] = useState(false);

  //Audio
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(
    null
  );
  const [audioChunks, setAudioChunks] = useState<BlobPart[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const isCancelledRef = useRef(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const waveformRef = useRef<NodeJS.Timeout | null>(null);
  const [seconds, setSeconds] = useState(0);
  const [waveformData, setWaveformData] = useState<number[]>(Array(15).fill(0));

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  useEffect(() => {
    if (userMessages?.data?.messages) {
      setTimeout(() => {
        scrollToBottom();
      }, 100);
    }
  }, [userMessages?.data?.messages]);

  // MODIFIED: Updated to handle real-time messages and chat joining
  useEffect(() => {
    if (selectedChat) {
      getMessages(selectedChat._id);
      // ADDED: Join the chat room when selecting a chat
      socket.emit("joinChat", selectedChat._id);
      // ADDED: Clear previous real-time messages when switching chats
      setRealtimeMessages([]);
    }

    // ADDED: Leave the previous chat room when switching
    return () => {
      if (selectedChat) {
        socket.emit("leaveChat", selectedChat._id);
      }
    };
  }, [selectedChat, getMessages]);

  // ADDED: Socket event listeners setup
  useEffect(() => {
    // ADDED: Listen for incoming messages
    const handleReceiveMessage = (data: SocketMessage) => {
      // Only add message if it's for the current chat AND it's from another user
      if (
        selectedChat &&
        data.chatId === selectedChat._id &&
        data.senderId !== currentUserId
      ) {
        const newRealtimeMessage: ApiMessage = {
          messageId: `temp-received-${Date.now()}`,
          text: data.text,
          isSeen: false,
          createdAt: data.createdAt,
          profilePic: data.profilePic || "/placeholder.svg",
          senderId: data.senderId,
          type:data.type
        };

        setRealtimeMessages((prev) => [...prev, newRealtimeMessage]);

        socket.emit("messageSeen", {
          chatId: selectedChat._id,
          receiverId: currentUserId,
        });
        // Auto-scroll when new message arrives
        setTimeout(() => {
          scrollToBottom();
        }, 100);
      }
    };

    // ADDED: Register socket event listener
    socket.on("receiveMessage", handleReceiveMessage);

    // ADDED: Cleanup socket listener on unmount
    return () => {
      socket.off("receiveMessage", handleReceiveMessage);
    };
  }, [selectedChat, currentUserId]);

  useEffect(() => {
    // Listen for message seen updates
    const handleMessageSeen = async ({
      chatId,
      seenBy,
    }: {
      chatId: string;
      seenBy: string;
    }) => {
      if (selectedChat && chatId === selectedChat._id) {
        // Update both API messages and realtime messages
        setRealtimeMessages((prev) =>
          prev.map((msg) =>
            msg.senderId === currentUserId ? { ...msg, isSeen: true } : msg
          )
        );
        // await refetch()
        // You might also want to refetch messages to update the API cache
        // or update your RTK Query cache here
      }
    };

    socket.on("messageSeen", handleMessageSeen);

    return () => {
      socket.off("messageSeen", handleMessageSeen);
    };
  }, [selectedChat, currentUserId]);

  // ADDED: Effect to mark messages as seen when viewing a chat
  useEffect(() => {
    if (selectedChat && currentUserId) {
      // Mark messages as seen when opening/viewing a chat
      socket.emit("messageSeen", {
        chatId: selectedChat._id,
        receiverId: currentUserId,
      });
    }
  }, [selectedChat, currentUserId]);

  const filteredChats =
    userChats?.filter((chat: ChatPreview) =>
      chat.otherUser.username.toLowerCase().includes(searchQuery.toLowerCase())
    ) || [];

  // MODIFIED: Updated to immediately show sent message and clear input
  const handleSendMessage = async () => {
    if (newMessage.trim() && selectedChat) {
      // ADDED: Immediately add the sent message to real-time messages for instant display

      const tempMessage: ApiMessage = {
        messageId: `temp-sent-${Date.now()}`,
        text: newMessage,
        isSeen: false,
        createdAt: new Date().toISOString(),
        profilePic: currentUser?.profilePicture || "/placeholder.svg", // You might want to use current user's profile pic here
        senderId: currentUserId,
        type:'message'
      };

      setRealtimeMessages((prev) => [...prev, tempMessage]);
      setNewMessage("");
      
      // Auto-scroll immediately
      setTimeout(() => {
        scrollToBottom();
      }, 100);
      
      try {
        await sendMessage({
          senderId: currentUserId,
          receiverId: selectedChat.otherUser._id,
          text: tempMessage.text,
          type: "message",
        });
        

        socket.emit("sendMessage", {
          chatId: selectedChat._id,
          senderId: currentUserId,
          profilePic: currentUser?.profilePicture || "/placeholder.svg",
          text: tempMessage.text,
          type:tempMessage.type,
          createdAt: new Date().toISOString(),
        });
      } catch (error) {
        console.log(error);
        // ADDED: Remove the temp message if sending fails
        setRealtimeMessages((prev) =>
          prev.filter((msg) => msg.messageId !== tempMessage.messageId)
        );
      }
      
    }
  };

  useEffect(() => {
    if (!socket || !selectedChat || !currentUserId) return;

    if (newMessage.trim()) {
      socket.emit("typing", {
        chatId: selectedChat._id,
        senderId: currentUserId,
      });

      const timeout = setTimeout(() => {
        socket.emit("stopTyping", {
          chatId: selectedChat._id,
          senderId: currentUserId,
        });
      }, 2000);

      return () => clearTimeout(timeout);
    } else {
      socket.emit("stopTyping", {
        chatId: selectedChat._id,
        senderId: currentUserId,
      });
    }
  }, [newMessage, selectedChat, currentUserId]);

  useEffect(() => {
    if (!socket || !selectedChat) return;

    const handleTyping = ({ chatId }: { chatId: string }) => {
      if (chatId === selectedChat._id) {
        setIsTyping(true);
      }
    };

    const handleStopTyping = ({ chatId }: { chatId: string }) => {
      if (chatId === selectedChat._id) {
        setIsTyping(false);
      }
    };

    socket.on("userTyping", handleTyping);
    socket.on("userStoppedTyping", handleStopTyping);

    return () => {
      socket.off("userTyping", handleTyping);
      socket.off("userStoppedTyping", handleStopTyping);
    };
  }, [socket, selectedChat]);

  useEffect(() => {
    if (!socket || !selectedChat || !currentUserId) return;
    const markMessagesAsSeen = () => {
      socket.emit("messageSeen", {
        chatId: selectedChat._id,
        receiverId: selectedChat.otherUser._id,
      });
    };
    markMessagesAsSeen();
  }, [selectedChat, realtimeMessages, currentUserId]);

  useEffect(() => {
    const handleMessageSeen = ({
      chatId,
      seenBy,
    }: {
      chatId: string;
      seenBy: string;
    }) => {
      if (selectedChat && chatId === selectedChat._id) {
        setRealtimeMessages((prev) =>
          prev.map((msg) =>
            msg.senderId === currentUserId ? { ...msg, isSeen: true } : msg
          )
        );
      }
    };

    socket.on("messageSeen", handleMessageSeen);

    return () => {
      socket.off("messageSeen", handleMessageSeen);
    };
  }, [selectedChat, currentUserId]);

  useEffect(() => {
    if (isRecording) {
      // Timer
      intervalRef.current = setInterval(() => {
        setSeconds((prev) => prev + 1);
      }, 1000);

      // Waveform animation
      waveformRef.current = setInterval(() => {
        setWaveformData(() =>
          Array(15)
            .fill(0)
            .map(() => Math.random() * 100)
        );
      }, 150);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (waveformRef.current) {
        clearInterval(waveformRef.current);
      }
      setWaveformData(Array(15).fill(0));
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (waveformRef.current) {
        clearInterval(waveformRef.current);
      }
    };
  }, [isRecording]);

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return "Today";
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Yesterday";
    } else {
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year:
          date.getFullYear() !== today.getFullYear() ? "numeric" : undefined,
      });
    }
  };

  // MODIFIED: Updated to combine API messages with real-time messages
  const groupMessagesByDate = (messages: ApiMessage[]) => {
    // ADDED: Combine API messages with real-time messages
    const allMessages = [...messages, ...realtimeMessages];
    const groups: { [key: string]: ApiMessage[] } = {};

    allMessages.forEach((message) => {
      const dateKey = formatDate(message.createdAt);
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(message);
    });

    return groups;
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setStream(stream);

      const recorder = new MediaRecorder(stream);
      const chunks: BlobPart[] = [];

      recorder.ondataavailable = (e) => chunks.push(e.data);

      recorder.onstop = async () => {
        stream.getTracks().forEach((track) => track.stop());
        setStream(null);

        if (isCancelledRef.current) {
          setAudioBlob(null);
          setAudioUrl(null);
          return;
        }

        const blob = new Blob(chunks, { type: "audio/webm" });
        setAudioBlob(blob);
        const url = await uploadAudioToCloudinary(blob);
        console.log(url);
        setAudioUrl(url);

        const tempMessage: ApiMessage = {
          messageId: `temp-sent-${Date.now()}`,
          text: url,
          isSeen: false,
          createdAt: new Date().toISOString(),
          profilePic: currentUser?.profilePicture || "/placeholder.svg", // You might want to use current user's profile pic here
          senderId: currentUserId,
          type:'audio'
        };

        setRealtimeMessages((prev)=> [...prev,tempMessage])
        
        await sendMessage({
          senderId: currentUserId,
          receiverId: selectedChat?.otherUser._id,
          text: url,
          type: "audio",
        });
        if(selectedChat){

          socket.emit("sendMessage", {
            chatId: selectedChat?._id,
            senderId: currentUserId,
            profilePic: currentUser?.profilePicture || "/placeholder.svg",
            text: url,
            type:'audio',
            createdAt: new Date().toISOString(),
          });
        }
        setStream(null);
      };

      recorder.start();
      setMediaRecorder(recorder);
      setAudioChunks(chunks);
      setIsRecording(true);
    } catch (error) {
      console.error("Microphone access denied or not available", error);
    }
  };
  const handleSendRecording = async () => {
    isCancelledRef.current = false;
    mediaRecorder?.stop();
    setIsRecording(false);
    setSeconds(0);
  };

  const cancelRecording = () => {
    isCancelledRef.current = true;
    mediaRecorder?.stop();
    setIsRecording(false);
    setSeconds(0);
  };

  const formatRecordTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <div
        className={`${
          selectedChat ? "hidden md:flex" : "flex"
        } w-full md:w-100 flex-col border-r border-amber-200 bg-white`}
      >
        <div className="p-4 border-b">
          <h1 className="text-xl font-semibold mb-3">Messages</h1>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <ScrollArea className="flex-1">
          <div className="p-2">
            {isLoading ? (
              <div className="flex items-center justify-center p-4">
                <div className="text-sm text-gray-500">Loading chats...</div>
              </div>
            ) : (
              filteredChats?.map((chat: ChatPreview) => (
                <div
                  key={chat._id}
                  onClick={() => {
                    setSelectedChat(chat);
                    setShowUserDetails(false);
                  }}
                  className={`flex items-center p-3 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors ${
                    selectedChat?._id === chat._id
                      ? "bg-blue-50 border border-blue-200"
                      : ""
                  }`}
                >
                  <div className="relative">
                    <Avatar className="h-12 w-12">
                      <AvatarImage
                        src={chat?.otherUser?.profilePic || "/placeholder.svg"}
                        alt={chat.otherUser.username}
                      />
                      <AvatarFallback>
                        {chat.otherUser.username.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>

                    {onlineUsers.includes(chat.otherUser._id) && (
                      <div className="absolute bottom-0 right-0 h-3 w-3 bg-green-500 border-2 border-white rounded-full"></div>
                    )}
                  </div>
                  <div className="ml-3 flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {chat.otherUser.username}
                      </p>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-gray-500 truncate">
                        {chat.lastMessage
                          ? chat.lastMessage.text
                          : "No messages yet"}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </div>

      {selectedChat ? (
        <div className="flex-1 flex flex-col">
          <div className="flex items-center justify-between p-4 border-b bg-white">
            <div className="flex items-center">
              <Button
                variant="ghost"
                size="sm"
                className="md:hidden mr-2"
                onClick={() => setSelectedChat(null)}
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div
                className="flex items-center cursor-pointer"
                onClick={() => setShowUserDetails(!showUserDetails)}
              >
                <div className="relative">
                  <Avatar className="h-10 w-10">
                    <AvatarImage
                      src={
                        selectedChat.otherUser.profilePic || "/placeholder.svg"
                      }
                      alt={selectedChat.otherUser.username}
                    />
                    <AvatarFallback>
                      {selectedChat.otherUser.username.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  {onlineUsers.includes(selectedChat.otherUser._id) && (
                    <div className="absolute bottom-0 right-0 h-3 w-3 bg-green-500 border-2 border-white rounded-full"></div>
                  )}
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium">
                    {selectedChat.otherUser.username}
                  </p>
                  <p className="text-xs text-gray-500">
                    {onlineUsers.includes(selectedChat.otherUser._id)
                      ? "Online"
                      : "Offline"}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="sm">
                <Phone className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm">
                <Video className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="flex flex-1 overflow-hidden">
            <div
              className={`${
                showUserDetails ? "hidden lg:flex" : "flex"
              } flex-1 flex-col h-full`}
            >
              <div className="flex-1 overflow-hidden">
                <ScrollArea className="h-full p-4" ref={scrollAreaRef}>
                  {messagesLoading ? (
                    <div className="flex items-center justify-center h-full">
                      <div className="text-sm text-gray-500">
                        Loading messages...
                      </div>
                    </div>
                  ) : userMessages?.data?.messages?.length > 0 ||
                    realtimeMessages.length > 0 ? (
                    <div className="space-y-4">
                      {Object.entries(
                        groupMessagesByDate(userMessages?.data?.messages || [])
                      ).map(([date, messages]) => (
                        <div key={date}>
                          <div className="flex items-center justify-center my-4">
                            <div className="bg-gray-100 text-gray-500 text-xs px-3 py-1 rounded-full">
                              {date}
                            </div>
                          </div>

                          <div className="space-y-3">
                            {messages.map((message: ApiMessage) => {
                              const isCurrentUser =
                                message.senderId === currentUserId ||
                                !message.senderId;

                              return (
                                <div
                                  key={message.messageId}
                                  className={`flex ${
                                    isCurrentUser
                                      ? "justify-end"
                                      : "justify-start"
                                  }`}
                                >
                                  <div
                                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                                      isCurrentUser
                                        ? "bg-blue-500 text-white"
                                        : "bg-gray-200 text-gray-900"
                                    }`}
                                  >
                                    <div className="flex gap-2">
                                      <div className={`h-7 w-7 `}>
                                        <img
                                          className={`object-contain ${message?.profilePic ? "" : "rounded-2xl"}`}
                                          src={message?.profilePic ? message?.profilePic : "https://imgs.search.brave.com/Rz6Zm1M0FFOnsFikSiYXilBeSRd6Gs795ZRe267PjKk/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly93d3cu/c2h1dHRlcnN0b2Nr/LmNvbS9pbWFnZS12/ZWN0b3IvcHJvZmls/ZS1wbGFjZWhvbGRl/ci1pbWFnZS1ncmF5/LXNpbGhvdWV0dGUt/MjYwbnctMTE5MDM4/NjMyNC5qcGc"}
                                          alt="Profile"
                                        />
                                      </div>
                                      {message?.type == "audio" ? (
                                        <audio
                                          controls
                                          src={message.text}
                                        ></audio>
                                      ) : (
                                        <p className="text-sm">
                                          {message.text}
                                        </p>
                                      )}
                                    </div>
                                    <div className="flex items-center justify-between mt-1">
                                      <p
                                        className={`text-xs ${
                                          isCurrentUser
                                            ? "text-blue-100"
                                            : "text-gray-500"
                                        }`}
                                      >
                                        {formatTime(message.createdAt)}
                                      </p>
                                      {isCurrentUser && (
                                        <div className="ml-2 flex items-center text-blue-100 text-xs">
                                          {message.isSeen ? (
                                            // Double tick for seen messages
                                            <div className="text-blue-100 text-xs flex">
                                              <span>✓</span>
                                              <span className="ml-[-2px]">
                                                ✓
                                              </span>
                                            </div>
                                          ) : (
                                            // Single tick for sent but not seen messages
                                            <div className="text-blue-200 text-xs">
                                              ✓
                                            </div>
                                          )}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                      <div ref={messagesEndRef} />
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <div className="text-center">
                        <div className="text-gray-400 mb-2">
                          <Send className="h-12 w-12 mx-auto" />
                        </div>
                        <p className="text-gray-500">No messages yet</p>
                        <p className="text-sm text-gray-400">
                          Start a conversation!
                        </p>
                      </div>
                    </div>
                  )}
                </ScrollArea>
              </div>

              {isTyping && (
                <div className="text-xs text-gray-500 px-4 pb-2">
                  {selectedChat?.otherUser?.username} is typing...
                </div>
              )}

              <div className="p-4 border-t bg-white">
                <div className="flex justify-between items-center space-x-2">
                  {!isRecording ? (
                    <Input
                      placeholder="Type a message..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={(e) =>
                        e.key === "Enter" && handleSendMessage()
                      }
                      className="flex-1"
                    />
                  ) : (
                    <div className="flex space-x-5 justify-items-center p-2 bg-green-50 border-2 border-green-200 rounded-lg  ">
                      {/* Recording Header */}
                      <div className="flex space-x-3 items-center justify-between`">
                        <div className="flex items-center space-x-4">
                          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                          <span className="text-sm font-medium text-gray-700">
                            Recording
                          </span>
                        </div>
                        <div className="text-sm font-mono font-semibold text-gray-800">
                          {formatRecordTime(seconds)}
                        </div>
                      </div>

                      {/* Waveform in Input */}
                      <div className="flex items-center justify-center space-x-1">
                        {waveformData.map((height, index) => (
                          <div
                            key={index}
                            className="w-1 bg-green-500 rounded-full transition-all duration-150"
                            style={{
                              height: `${Math.max(6, (height / 100) * 20)}px`,
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                  <div className="flex gap-3">
                    {isRecording ? (
                      <Button
                        onClick={handleSendRecording}
                        className="bg-green-800"
                        size="sm"
                      >
                        <IoMdSend />
                      </Button>
                    ) : (
                      <Button disabled={newMessage.length > 0} size="sm" onClick={startRecording}>
                        <AiOutlineAudio />
                      </Button>
                    )}
                    {isRecording ? (
                      <Button size="sm" onClick={cancelRecording}>
                        <MdDelete color="red" />
                      </Button>
                    ) : (
                      <Button
                        onClick={handleSendMessage}
                        size="sm"
                        disabled={!newMessage.trim()}
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                    )}
                  </div>

               
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="hidden md:flex flex-1 items-center justify-center bg-gray-50">
          <div className="text-center">
            <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <Send className="h-8 w-8 text-gray-400" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Select a conversation
            </h2>
            <p className="text-gray-500">
              Choose from your existing conversations or start a new one
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
