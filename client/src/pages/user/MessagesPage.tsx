"use client";

import { useEffect, useState, useRef } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Send,
  Phone,
  Video,
  MoreVertical,
  Search,
  ArrowLeft,
  Volume2,
  CheckCheck,
  Check,
} from "lucide-react";
import { AiOutlineAudio } from "react-icons/ai";
import { MdDelete } from "react-icons/md";
import { IoMdSend } from "react-icons/io";
import { useFindChatByUserIdQuery, useGetChatsQuery } from "@/services/chatApi";
import type { ChatPreview } from "@/types/chat";
import { useOnlineUsers } from "@/hooks/useOnlineUsers";
import {
  useLazyGetMessagesQuery,
  useSendMessageMutation,
} from "@/services/chatApi";
import { useSelector } from "react-redux";
import type { RootState } from "@/redux/store/store";
import { socket } from "../../lib/socket";
import { uploadAudioToCloudinary } from "@/utils/cloudinary";
import { useParams } from "react-router-dom";
import { useUsernameAndProfileQuery } from "@/services/authApi";

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
  username: string;
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

interface SocketMessage {
  chatId: string;
  senderId: string;
  profilePic?: string;
  username?: string;
  text: string;
  type: string;
  createdAt: string;
}

export default function MessagesPage() {
  const { userId } = useParams();
  console.log(userId);

  const [selectedChat, setSelectedChat] = useState<ChatPreview | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [showUserDetails, setShowUserDetails] = useState(false);
  const currentUser = useSelector((state: RootState) => state.user.user);
  const [realtimeMessages, setRealtimeMessages] = useState<ApiMessage[]>([]);

  // State for new chat scenario
  const [isNewChat, setIsNewChat] = useState(false);
  const [newChatUser, setNewChatUser] = useState<any>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const {
    data: userChats,
    isLoading,
    refetch: refetchChats,
  } = useGetChatsQuery(undefined);
  const { onlineUsers } = useOnlineUsers();
  const [getMessages, { data: userMessages, isLoading: messagesLoading }] =
    useLazyGetMessagesQuery();
  const currentUserId = useSelector((state: RootState) => state.user.user?.id);
  const [sendMessage] = useSendMessageMutation();
  const [isTyping, setIsTyping] = useState(false);

  const { data: userDetails } = useUsernameAndProfileQuery(userId);
  const { data: chat, isLoading: chatLoading } = useFindChatByUserIdQuery(
    userId,
    {
      skip: !userId,
    }
  );

  // Audio states
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
   const [isAudioPlaying, setIsAudioPlaying] = useState(false)

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  // Handle new chat scenario and transitions
  useEffect(() => {
    if (userId && userDetails && !chatLoading) {
      if (chat) {
        // Existing chat found - transition from new chat to existing chat
        if (isNewChat) {
          // We're transitioning from new chat to existing chat
          // Clear the new chat state but keep messages for smooth transition
          setIsNewChat(false);
          setNewChatUser(null);
        }
        setSelectedChat(chat);
      } else {
        // No existing chat, set up new chat scenario
        if (!isNewChat) {
          setIsNewChat(true);
          setNewChatUser(userDetails);
          setSelectedChat(null);
          setRealtimeMessages([]); // Clear any previous messages
        }
      }
    }
  }, [chat, userDetails, userId, chatLoading, isNewChat]);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (userMessages?.data?.messages || realtimeMessages.length > 0) {
      setTimeout(() => {
        scrollToBottom();
      }, 100);
    }
  }, [userMessages?.data?.messages, realtimeMessages]);

  // Handle chat selection and socket events
  useEffect(() => {
    if (selectedChat) {
      getMessages(selectedChat._id);
      socket.emit("joinChat", selectedChat._id);

      // Don't clear realtime messages immediately to allow smooth transition
      setTimeout(() => {
        if (!isNewChat) {
          setRealtimeMessages([]);
        }
      }, 500);
    }

    return () => {
      if (selectedChat) {
        socket.emit("leaveChat", selectedChat._id);
      }
    };
  }, [selectedChat, getMessages]);

  // Socket event listeners for receiving messages
  useEffect(() => {
    const handleReceiveMessage = (data: SocketMessage) => {
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
          profilePic: data.profilePic,
          username: data?.username,
          senderId: data.senderId,
          type: data.type,
        };

        setRealtimeMessages((prev) => [...prev, newRealtimeMessage]);
        socket.emit("messageSeen", {
          chatId: selectedChat._id,
          receiverId: currentUserId,
        });

        setTimeout(() => {
          scrollToBottom();
        }, 100);
      }
    };

    socket.on("receiveMessage", handleReceiveMessage);

    return () => {
      socket.off("receiveMessage", handleReceiveMessage);
    };
  }, [selectedChat, currentUserId]);

  // Handle message seen events
  useEffect(() => {
    const handleMessageSeen = async ({
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

  // Mark messages as seen when viewing chat
  useEffect(() => {
    if (selectedChat && currentUserId) {
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

  // Handle sending messages for both new chat and existing chat
  const handleSendMessage = async () => {
    if (newMessage.trim()) {
      const tempMessage: ApiMessage = {
        messageId: `temp-sent-${Date.now()}`,
        text: newMessage,
        isSeen: false,
        createdAt: new Date().toISOString(),
        username: currentUser?.username || "",
        profilePic: currentUser?.profilePicture || "/placeholder.svg",
        senderId: currentUserId,
        type: "message",
      };

      // Add message to realtime messages immediately for instant feedback

      setRealtimeMessages((prev) => [...prev, tempMessage]);

      setNewMessage("");

      setTimeout(() => {
        scrollToBottom();
      }, 100);

      try {
        if (isNewChat && newChatUser) {
          // For new chat scenario
          await sendMessage({
            senderId: currentUserId,
            receiverId: newChatUser._id,
            text: tempMessage.text,
            type: "message",
          });

          // setRealtimeMessages((prev) => [...prev, tempMessage])
          // Refetch chats to get the newly created chat
          await refetchChats();
        } else if (selectedChat) {
          // For existing chat scenario
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
            username: currentUser?.username,
            text: tempMessage.text,
            type: tempMessage.type,
            createdAt: new Date().toISOString(),
          });
        }
      } catch (error) {
        console.log(error);
        // Remove the temp message if sending fails
        setRealtimeMessages((prev) =>
          prev.filter((msg) => msg.messageId !== tempMessage.messageId)
        );
      }
    }
  };

  // Typing indicators
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

  // Audio recording effects
  useEffect(() => {
    if (isRecording) {
      intervalRef.current = setInterval(() => {
        setSeconds((prev) => prev + 1);
      }, 1000);

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

  const groupMessagesByDate = (messages: ApiMessage[]) => {
    const allMessages = [...(messages || []), ...realtimeMessages];
    const groups: { [key: string]: ApiMessage[] } = {};

    allMessages.forEach((message) => {
      const dateKey = formatDate(message.createdAt);
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(message);
    });

    // Sort messages within each group by timestamp
    Object.keys(groups).forEach((date) => {
      groups[date].sort(
        (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );
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
          profilePic: currentUser?.profilePicture || "/placeholder.svg",
          username: currentUser?.username || "",
          senderId: currentUserId,
          type: "audio",
        };

        setRealtimeMessages((prev) => [...prev, tempMessage]);

        try {
          if (isNewChat && newChatUser) {
            await sendMessage({
              senderId: currentUserId,
              receiverId: newChatUser._id,
              text: url,
              type: "audio",
            });
            await refetchChats();
          } else if (selectedChat) {
            await sendMessage({
              senderId: currentUserId,
              receiverId: selectedChat?.otherUser._id,
              text: url,
              type: "audio",
            });

            socket.emit("sendMessage", {
              chatId: selectedChat?._id,
              senderId: currentUserId,
              profilePic: currentUser?.profilePicture || "/placeholder.svg",
              text: url,
              type: "audio",
              createdAt: new Date().toISOString(),
            });
          }
        } catch (error) {
          console.error("Error sending audio message:", error);
          setRealtimeMessages((prev) =>
            prev.filter((msg) => msg.messageId !== tempMessage.messageId)
          );
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

  // Function to handle back navigation from new chat
  const handleBackFromNewChat = () => {
    setIsNewChat(false);
    setNewChatUser(null);
    setRealtimeMessages([]);
  };

  // Render message component
  const renderMessage = (message: ApiMessage) => {
    const isCurrentUser =
      message.senderId === currentUserId || !message.senderId;
    return (
      <div className={`flex mb-4 ${isCurrentUser ? "justify-end" : "justify-start"}`}>
      <div className={`flex max-w-[75%] ${isCurrentUser ? "flex-row-reverse" : "flex-row"} items-end gap-2`}>
        {/* Avatar */}
        <div className="flex-shrink-0">
          <Avatar className="h-8 w-8 border-2 border-white shadow-sm">
            {message?.profilePic ? (
              <AvatarImage
                src={message.profilePic || "/placeholder.svg"}
                alt={message.username}
                className="object-cover"
              />
            ) : (
              <AvatarImage src="/placeholder.svg?height=32&width=32" alt="Default" />
            )}
            <AvatarFallback className="text-xs font-medium bg-gradient-to-br from-blue-400 to-purple-500 text-white">
              {message?.username?.charAt(0)?.toUpperCase() || "?"}
            </AvatarFallback>
          </Avatar>
        </div>

        {/* Message Bubble */}
        <div className="flex flex-col">
          {/* Username (only for others) */}
          {!isCurrentUser && (
            <div className="mb-1 ml-3">
              <span className="text-xs font-medium text-gray-600">{message.username}</span>
            </div>
          )}

          {/* Message Content */}
          <div
            className={`relative px-4 py-3 rounded-2xl shadow-sm transition-all duration-200 hover:shadow-md ${
              isCurrentUser
                ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-br-md"
                : "bg-white border border-gray-200 text-gray-900 rounded-bl-md"
            }`}
          >
            {/* Message Body */}
            {message?.type === "audio" ? (
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-full ${isCurrentUser ? "bg-blue-400" : "bg-gray-100"}`}>
                  <Volume2 className={`h-4 w-4 ${isCurrentUser ? "text-white" : "text-gray-600"}`} />
                </div>
                <audio
                  controls
                  src={message.text}
                  className="h-8 flex-1"
                  onPlay={() => setIsAudioPlaying(true)}
                  onPause={() => setIsAudioPlaying(false)}
                  onEnded={() => setIsAudioPlaying(false)}
                />
              </div>
            ) : (
              <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">{message.text}</p>
            )}

            {/* Message Info */}
            <div
              className={`flex items-center justify-between mt-2 gap-2 ${
                isCurrentUser ? "flex-row-reverse" : "flex-row"
              }`}
            >
              {/* Timestamp */}
              <span className={`text-xs ${isCurrentUser ? "text-blue-100" : "text-gray-500"}`}>
                {formatTime(message.createdAt)}
              </span>

              {/* Read Status (only for current user) */}
              {isCurrentUser && (
                <div className="flex items-center">
                  {message.isSeen ? (
                    <CheckCheck className="h-4 w-4 text-blue-200" />
                  ) : (
                    <Check className="h-4 w-4 text-blue-300" />
                  )}
                </div>
              )}
            </div>

            {/* Message Tail */}
            <div
              className={`absolute top-4 w-3 h-3 transform rotate-45 ${
                isCurrentUser
                  ? "-right-1 bg-gradient-to-r from-blue-500 to-blue-600"
                  : "-left-1 bg-white border-l border-b border-gray-200"
              }`}
            />
          </div>
        </div>
      </div>
    </div>
    );
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Chat List Sidebar */}
      <div
        className={`${
          selectedChat || isNewChat ? "hidden md:flex" : "flex"
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
                    setIsNewChat(false);
                    setNewChatUser(null);
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
                        alt={chat?.otherUser?.username}
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
                          ? chat.lastMessage.type == "audio"
                            ? "Voice Message"
                            : chat.lastMessage.text
                          : "No last Message"}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Chat Area */}
      {selectedChat || isNewChat ? (
        <div className="flex-1 flex flex-col">
          {/* Chat Header */}
          <div className="flex items-center justify-between p-4 border-b bg-white">
            <div className="flex items-center">
              <Button
                variant="ghost"
                size="sm"
                className="md:hidden mr-2"
                onClick={() => {
                  if (isNewChat) {
                    handleBackFromNewChat();
                  } else {
                    setSelectedChat(null);
                  }
                }}
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
                        isNewChat
                          ? newChatUser?.profilePic || "/placeholder.svg"
                          : selectedChat?.otherUser?.profilePic ||
                            "/placeholder.svg"
                      }
                      alt={
                        isNewChat
                          ? newChatUser?.username
                          : selectedChat?.otherUser?.username
                      }
                    />
                    <AvatarFallback>
                      {(isNewChat
                        ? newChatUser?.username
                        : selectedChat?.otherUser?.username
                      )
                        ?.charAt(0)
                        .toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  {onlineUsers.includes(
                    isNewChat ? newChatUser?._id : selectedChat?.otherUser?._id
                  ) && (
                    <div className="absolute bottom-0 right-0 h-3 w-3 bg-green-500 border-2 border-white rounded-full"></div>
                  )}
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium">
                    {isNewChat
                      ? newChatUser?.username
                      : selectedChat?.otherUser?.username}
                  </p>
                  <p className="text-xs text-gray-500">
                    {onlineUsers.includes(
                      isNewChat
                        ? newChatUser?._id
                        : selectedChat?.otherUser?._id
                    )
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

          {/* Messages Area */}
          <div className="flex flex-1 overflow-hidden">
            <div
              className={`${
                showUserDetails ? "hidden lg:flex" : "flex"
              } flex-1 flex-col h-full`}
            >
              <div className="flex-1 overflow-hidden">
                <ScrollArea className="h-full p-4" ref={scrollAreaRef}>
                  {isNewChat ? (
                    // New chat scenario
                    <div className="space-y-4">
                      {realtimeMessages.length === 0 ? (
                        <div className="flex items-center justify-center h-full">
                          <div className="text-center">
                            <Avatar className="h-16 w-16 mx-auto mb-4">
                              <AvatarImage
                                src={
                                  newChatUser?.profilePic || "/placeholder.svg"
                                }
                                alt={newChatUser?.username}
                              />
                              <AvatarFallback className="text-lg">
                                {newChatUser?.username?.charAt(0).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                              Start a conversation with {newChatUser?.username}
                            </h3>
                            <p className="text-sm text-gray-500 mb-4">
                              Send a message to start chatting
                            </p>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="flex items-center justify-center my-4">
                            <div className="bg-gray-100 text-gray-500 text-xs px-3 py-1 rounded-full">
                              Today
                            </div>
                          </div>
                          <div className="space-y-3">
                            {realtimeMessages.map((message) =>
                              renderMessage(message)
                            )}
                          </div>
                        </>
                      )}
                      <div ref={messagesEndRef} />
                    </div>
                  ) : messagesLoading ? (
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
                            {messages.map((message) => renderMessage(message))}
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

              {/* Typing Indicator */}
              {isTyping && !isNewChat && (
                <div className="text-xs text-gray-500 px-4 pb-2">
                  {selectedChat?.otherUser?.username} is typing...
                </div>
              )}

              {/* Message Input */}
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
                    <div className="flex space-x-5 justify-items-center p-2 bg-green-50 border-2 border-green-200 rounded-lg flex-1">
                      <div className="flex space-x-3 items-center justify-between">
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
                      <Button
                        disabled={newMessage.length > 0}
                        size="sm"
                        onClick={startRecording}
                      >
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
        // Empty state when no chat is selected
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
