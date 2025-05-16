"use client"

import { X, Bell } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface NotificationsSidebarProps {
  isOpen: boolean
  onClose: () => void
}

export function NotificationsSidebar({ isOpen, onClose }: NotificationsSidebarProps) {
  const notifications = [
    {
      id: 1,
      user: {
        name: "Sarah Johnson",
        username: "sarahj",
        avatar: "/placeholder.svg?height=40&width=40",
      },
      action: "liked your post",
      time: "5 minutes ago",
      read: false,
    },
    {
      id: 2,
      user: {
        name: "Michael Chen",
        username: "mikechen",
        avatar: "/placeholder.svg?height=40&width=40",
      },
      action: "started following you",
      time: "2 hours ago",
      read: false,
    },
    {
      id: 3,
      user: {
        name: "Jessica Williams",
        username: "jesswill",
        avatar: "/placeholder.svg?height=40&width=40",
      },
      action: "commented on your post",
      time: "1 day ago",
      read: true,
    },
  ]

  return (
    <>
      {/* Overlay */}
      {isOpen && <div className="fixed inset-0 bg-black/20 z-40" onClick={onClose} />}

      {/* Notifications Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-100 bg-white shadow-lg transform transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-4 border-b">
            <h2 className="text-xl font-bold">Notifications</h2>
            <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-100" aria-label="Close notifications">
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full p-4 text-center">
                <Bell className="h-12 w-12 text-gray-300 mb-2" />
                <p className="text-gray-500">No notifications yet</p>
              </div>
            ) : (
              <div className="divide-y">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 hover:bg-gray-50 transition-colors ${!notification.read ? "bg-amber-50" : ""}`}
                  >
                    <div className="flex items-start gap-3">
                      <Avatar className="h-10 w-10 border border-amber-200">
                        <AvatarImage
                          src={notification.user.avatar || "/placeholder.svg"}
                          alt={notification.user.name}
                        />
                        <AvatarFallback>{notification.user.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="text-sm">
                          <span className="font-semibold">{notification.user.name}</span> {notification.action}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">{notification.time}</p>
                      </div>
                      {!notification.read && <div className="h-2 w-2 rounded-full bg-amber-500"></div>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="p-4 border-t">
            <button className="w-full py-2 text-center text-sm text-amber-600 hover:text-amber-700 font-medium">
              Mark all as read
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
