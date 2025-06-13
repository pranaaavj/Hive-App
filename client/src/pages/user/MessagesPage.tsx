"use client"

import { useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Send, Phone, Video, MoreVertical, Search, ArrowLeft } from "lucide-react"
import { useGetChatsQuery } from "@/services/chatApi"
import { ChatPreview } from "@/types/chat"
import { useOnlineUsers } from "@/hooks/useOnlineUsers"
// TypeScript interfaces
interface User {
  id: string
  name: string
  username: string
  avatar: string
  isOnline: boolean
  lastSeen?: string
  bio?: string
  followers?: number
  following?: number
}

interface Message {
  id: string
  senderId: string
  receiverId: string
  content: string
  timestamp: Date
  isRead: boolean
}

interface Chat {
  id: string
  user: User
  lastMessage: Message
  unreadCount: number
}

// Mock data
const currentUser: User = {
  id: "current-user",
  name: "You",
  username: "@you",
  avatar: "/placeholder.svg?height=40&width=40",
  isOnline: true,
}

const mockUsers: User[] = [
  {
    id: "1",
    name: "Alice Johnson",
    username: "@alice_j",
    avatar: "/placeholder.svg?height=40&width=40",
    isOnline: true,
    bio: "Digital artist and coffee enthusiast ☕️",
    followers: 1234,
    following: 567,
  },
  {
    id: "2",
    name: "Bob Smith",
    username: "@bobsmith",
    avatar: "/placeholder.svg?height=40&width=40",
    isOnline: false,
    lastSeen: "2 hours ago",
    bio: "Software developer | Tech blogger",
    followers: 890,
    following: 234,
  },
  {
    id: "3",
    name: "Carol Davis",
    username: "@carol_d",
    avatar: "/placeholder.svg?height=40&width=40",
    isOnline: true,
    bio: "Travel photographer 📸 | Adventure seeker",
    followers: 2345,
    following: 1234,
  },
  {
    id: "4",
    name: "David Wilson",
    username: "@davidw",
    avatar: "/placeholder.svg?height=40&width=40",
    isOnline: false,
    lastSeen: "1 day ago",
    bio: "Fitness coach | Nutrition expert",
    followers: 567,
    following: 123,
  },
  {
    id: "5",
    name: "Emma Brown",
    username: "@emma_b",
    avatar: "/placeholder.svg?height=40&width=40",
    isOnline: true,
    bio: "UX Designer | Creative thinker",
    followers: 1567,
    following: 789,
  },
]

const mockMessages: Message[] = [
  {
    id: "1",
    senderId: "1",
    receiverId: "current-user",
    content: "Hey! How are you doing?",
    timestamp: new Date(Date.now() - 1000 * 60 * 30),
    isRead: true,
  },
  {
    id: "2",
    senderId: "current-user",
    receiverId: "1",
    content: "I'm doing great! Just finished working on a new project.",
    timestamp: new Date(Date.now() - 1000 * 60 * 25),
    isRead: true,
  },
  {
    id: "3",
    senderId: "1",
    receiverId: "current-user",
    content: "That sounds awesome! What kind of project?",
    timestamp: new Date(Date.now() - 1000 * 60 * 20),
    isRead: true,
  },
  {
    id: "4",
    senderId: "current-user",
    receiverId: "1",
    content: "It's a social media chat interface. Really excited about it!",
    timestamp: new Date(Date.now() - 1000 * 60 * 15),
    isRead: true,
  },
  {
    id: "5",
    senderId: "1",
    receiverId: "current-user",
    content: "Can't wait to see it! 🚀",
    timestamp: new Date(Date.now() - 1000 * 60 * 5),
    isRead: false,
  },
  {
    id: "6",
    senderId: "2",
    receiverId: "current-user",
    content: "Thanks for the code review!",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
    isRead: true,
  },
  {
    id: "7",
    senderId: "3",
    receiverId: "current-user",
    content: "Check out my latest photos from Iceland!",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4),
    isRead: true,
  },
  {
    id: "8",
    senderId: "4",
    receiverId: "current-user",
    content: "Ready for tomorrow's workout session?",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24),
    isRead: true,
  },
  {
    id: "9",
    senderId: "5",
    receiverId: "current-user",
    content: "Love the new design concepts!",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 6),
    isRead: true,
  },
]

// Generate chats from users and messages
const generateChats = (): Chat[] => {
  return mockUsers
    .map((user) => {
      const userMessages = mockMessages.filter((msg) => msg.senderId === user.id || msg.receiverId === user.id)
      const lastMessage = userMessages.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())[0]
      const unreadCount = userMessages.filter((msg) => msg.senderId === user.id && !msg.isRead).length

      return {
        id: user.id,
        user,
        lastMessage,
        unreadCount,
      }
    })
    .sort((a, b) => b.lastMessage?.timestamp.getTime() - a.lastMessage?.timestamp.getTime())
}

export default function MessagesPage() {
  const [chats] = useState<Chat[]>(generateChats())
  const [selectedChat, setSelectedChat] = useState<ChatPreview |null>(null)
  const [newMessage, setNewMessage] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [showUserDetails, setShowUserDetails] = useState(false)
  const {data: userChats, isLoading} = useGetChatsQuery(undefined)
  const {onlineUsers} = useOnlineUsers()

  const filteredChats = chats.filter(
    (chat) =>
      chat.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      chat.user.username.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const getMessagesForChat = (chatId: string): Message[] => {
    return mockMessages
      .filter(
        (msg) =>
          (msg.senderId === chatId && msg.receiverId === "current-user") ||
          (msg.senderId === "current-user" && msg.receiverId === chatId),
      )
      .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime())
  }

  const handleSendMessage = () => {
    if (newMessage.trim() && selectedChat) {
      // In a real app, you would send this to your backend
      console.log("Sending message:", newMessage, "to:", selectedChat.user.name)
      setNewMessage("")
    }
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    })
  }

  // const formatLastSeen = (date: Date) => {
  //   const now = new Date()
  //   const diff = now.getTime() - date.getTime()
  //   const minutes = Math.floor(diff / (1000 * 60))
  //   const hours = Math.floor(diff / (1000 * 60 * 60))
  //   const days = Math.floor(diff / (1000 * 60 * 60 * 24))

  //   if (minutes < 1) return "Just now"
  //   if (minutes < 60) return `${minutes}m ago`
  //   if (hours < 24) return `${hours}h ago`
  //   return `${days}d ago`
  // }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Chat List Sidebar */}
      <div className={`${selectedChat ? "hidden md:flex" : "flex"} w-full md:w-100 flex-col border-r border-amber-200 bg-white`}>
        {/* Header */}
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

        {/* Chat List */}
        <ScrollArea className="flex-1">
          <div className="p-2">
            {userChats?.map((chat: ChatPreview) => (
              <div
                key={chat._id}
                onClick={() => {
                  setSelectedChat(chat)
                  setShowUserDetails(false)
                }}
                className={`flex items-center p-3 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors ${
                  selectedChat?._id === chat._id ? "bg-blue-50 border border-blue-200" : ""
                }`}
              >
            
                <div className="relative">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={chat?.otherUser?.profilePic || "/placeholder.svg"} alt={chat.otherUser.username} />
                    <AvatarFallback>{chat.otherUser.username.charAt(0)}</AvatarFallback>
                  </Avatar>
                  
                  {onlineUsers.includes(chat.otherUser._id) && (
                    <div className="absolute bottom-0 right-0 h-3 w-3 bg-green-500 border-2 border-white rounded-full"></div>
                  )}
                </div>
                <div className="p ml-3 flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-900 truncate">{chat.otherUser.username}</p>
                    {/* <p className="text-xs text-gray-500">
                      {chat.lastMessage && formatLastSeen(chat.lastMessage.timestamp)}
                    </p> */}
                  </div>
                  {/* <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-500 truncate">{chat.lastMessage?.text || "No messages yet"}</p>
                    {chat.unreadCount > 0 && (
                      <Badge variant="default" className="ml-2 h-5 w-5 p-0 flex items-center justify-center text-xs">
                        {chat.unreadCount}
                      </Badge>
                    )}
                  </div> */}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Main Chat Area */}
      {selectedChat ? (
        <div className="flex-1 flex flex-col">
          {/* Chat Header */}
          <div className="flex items-center justify-between p-4 border-b bg-white">
            <div className="flex items-center">
              <Button variant="ghost" size="sm" className="md:hidden mr-2" onClick={() => setSelectedChat(null)}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div className="flex items-center cursor-pointer" onClick={() => setShowUserDetails(!showUserDetails)}>
                <div className="relative">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={selectedChat.user.avatar || "/placeholder.svg"} alt={selectedChat.user.name} />
                    <AvatarFallback>{selectedChat.user.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  {selectedChat.user.isOnline && (
                    <div className="absolute bottom-0 right-0 h-3 w-3 bg-green-500 border-2 border-white rounded-full"></div>
                  )}
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium">{selectedChat.user.name}</p>
                  <p className="text-xs text-gray-500">
                    {selectedChat.user.isOnline ? "Online" : `Last seen ${selectedChat.user.lastSeen}`}
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

          <div className="flex flex-1">
            {/* Messages Area */}
            <div className={`${showUserDetails ? "hidden lg:flex" : "flex"} flex-1 flex-col`}>
              {/* Messages */}
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                  {getMessagesForChat(selectedChat.id).map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.senderId === "current-user" ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                          message.senderId === "current-user" ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-900"
                        }`}
                      >
                        <p className="text-sm">{message.content}</p>
                        <p
                          className={`text-xs mt-1 ${
                            message.senderId === "current-user" ? "text-blue-100" : "text-gray-500"
                          }`}
                        >
                          {formatTime(message.timestamp)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>

              {/* Message Input */}
              <div className="p-4 border-t bg-white">
                <div className="flex items-center space-x-2">
                  <Input
                    placeholder="Type a message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                    className="flex-1"
                  />
                  <Button onClick={handleSendMessage} size="sm">
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* User Details Sidebar */}
            {showUserDetails && (
              <div className="w-80 border-l bg-white">
                <div className="p-6">
                  <div className="text-center">
                    <Avatar className="h-20 w-20 mx-auto mb-4">
                      <AvatarImage src={selectedChat.user.avatar || "/placeholder.svg"} alt={selectedChat.user.name} />
                      <AvatarFallback className="text-lg">{selectedChat.user.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <h2 className="text-xl font-semibold">{selectedChat.user.name}</h2>
                    <p className="text-gray-500">{selectedChat.user.username}</p>
                    <div className="flex items-center justify-center mt-2">
                      <div
                        className={`h-2 w-2 rounded-full mr-2 ${
                          selectedChat.user.isOnline ? "bg-green-500" : "bg-gray-400"
                        }`}
                      ></div>
                      <span className="text-sm text-gray-500">
                        {selectedChat.user.isOnline ? "Online" : `Last seen ${selectedChat.user.lastSeen}`}
                      </span>
                    </div>
                  </div>

                  <Separator className="my-6" />

                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm font-medium text-gray-900 mb-2">Bio</h3>
                      <p className="text-sm text-gray-600">{selectedChat.user.bio}</p>
                    </div>

                    <div className="flex justify-between">
                      <div className="text-center">
                        <p className="text-lg font-semibold">{selectedChat.user.followers?.toLocaleString()}</p>
                        <p className="text-xs text-gray-500">Followers</p>
                      </div>
                      <div className="text-center">
                        <p className="text-lg font-semibold">{selectedChat.user.following?.toLocaleString()}</p>
                        <p className="text-xs text-gray-500">Following</p>
                      </div>
                    </div>
                  </div>

                  <Separator className="my-6" />

                  <div className="space-y-2">
                    <Button variant="outline" className="w-full">
                      View Profile
                    </Button>
                    <Button variant="outline" className="w-full">
                      Mute Notifications
                    </Button>
                    <Button variant="outline" className="w-full text-red-600 hover:text-red-700">
                      Block User
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* No Chat Selected */
        <div className="hidden md:flex flex-1 items-center justify-center bg-gray-50">
          <div className="text-center">
            <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <Send className="h-8 w-8 text-gray-400" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Select a conversation</h2>
            <p className="text-gray-500">Choose from your existing conversations or start a new one</p>
          </div>
        </div>
      )}
    </div>
  )
}
