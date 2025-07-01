"use client";

import { X, Bell, Heart, MessageCircle, UserPlus, Check } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNotificationsQuery } from "@/services/chatApi";
import { formatDistanceToNow } from "date-fns";
import { useEffect, useState } from "react";
import { socket } from "@/lib/socket";
import { useFollowUserMutation } from "@/services/authApi";

export interface Notification {
  _id: string;
  userId: string;
  fromUser: {
    _id: string;
    username: string;
    profilePicture: string;
  };
  type: "comment" | "like" | "follow";
  message: string;
  postId?: string | null;
  postImage: string;
  isFollowing: boolean;
  isFollowed: boolean;
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

interface NotificationsSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NotificationsSidebar({
  isOpen,
  onClose,
}: NotificationsSidebarProps) {
  const {
    data: initialNotifications,
    isLoading,
    refetch,
  } = useNotificationsQuery(undefined, { skip: !isOpen });
  const [followUser] = useFollowUserMutation();
  const [followingUsers, setFollowingUsers] = useState<Set<string>>(new Set());

  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    if (initialNotifications) {
      setNotifications(initialNotifications);
    }
  }, [initialNotifications]);

  useEffect(() => {
    const handleNeWNotification = (notification: Notification) => {
      setNotifications((prev) => [notification, ...prev]);
    };
    socket.on("notification", handleNeWNotification);

    return () => {
      socket.off("notification", handleNeWNotification);
    };
  }, []);

  const handleFollowBack = async (userId: string) => {
    try {
      await followUser(userId);
      await refetch();
    } catch (error) {
      console.error("Failed to follow user:", error);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "like":
        return <Heart className="h-4 w-4 text-red-500" />;
      case "comment":
        return <MessageCircle className="h-4 w-4 text-blue-500" />;
      case "follow":
        return <UserPlus className="h-4 w-4 text-green-500" />;
      default:
        return <Bell className="h-4 w-4 text-gray-500" />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case "like":
        return "border-red-100 bg-red-50/50";
      case "comment":
        return "border-blue-100 bg-blue-50/50";
      case "follow":
        return "border-green-100 bg-green-50/50";
      default:
        return "border-gray-100 bg-gray-50/50";
    }
  };

  const renderNotificationContent = (notification: Notification) => {
    const isFollowing = notification?.isFollowing;
    const isFollowed = notification?.isFollowed;

    return (
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <p className="text-sm leading-relaxed">
              <span className="font-semibold text-gray-900">
                {notification?.fromUser?.username}
              </span>{" "}
              <span className="text-gray-700">{notification?.message}</span>
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {formatDistanceToNow(new Date(notification?.createdAt), {
                addSuffix: true,
              })}
            </p>
          </div>

          {/* Follow back button for follow notifications */}
          {notification?.type === "follow" ? (
            <Button
              size="sm"
              variant={
                isFollowing || (!isFollowing && !isFollowed)
                  ? "secondary"
                  : "default"
              }
              onClick={() => handleFollowBack(notification?.fromUser._id)}
              disabled={isFollowing}
              className="shrink-0 h-8 px-3 text-xs"
            >
              {(isFollowing && isFollowed) || (isFollowing && !isFollowed) ? (
                <>
                  <Check className="h-3 w-3 mr-1" />
                  Following
                </>
              ) : !isFollowing && isFollowed ? (
                "Follow Back"
              ) : (
                "Follow"
              )}
            </Button>
          ) : (
            <div>
              <div className="w-10 aspect-[4/5] overflow-hidden">
                <img
                  src={notification?.postImage}
                  alt="Notification Post"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-40 backdrop-blur-sm"
          onClick={onClose}
        />
      )}

      {/* Notifications Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-96 bg-white shadow-xl border-r transform transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b bg-gray-50/50">
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-gray-600" />
              <h2 className="text-lg font-semibold text-gray-900">
                Notifications
              </h2>
              {notifications?.length > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {notifications.length}
                </Badge>
              )}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0 hover:bg-gray-100"
              aria-label="Close notifications"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            {isLoading ? (
              <div className="flex items-center justify-center h-32">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-600"></div>
              </div>
            ) : notifications?.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full p-6 text-center">
                <div className="rounded-full bg-gray-100 p-4 mb-4">
                  <Bell className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No notifications yet
                </h3>
                <p className="text-sm text-gray-500 max-w-sm">
                  When someone likes, comments, or follows you, you'll see it
                  here.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {notifications?.map((notification: Notification) => (
                  <div
                    key={notification?._id}
                    className={`p-4 hover:bg-gray-50 transition-colors cursor-pointer ${
                      !notification?.isRead
                        ? "bg-blue-50/30 border-l-2 border-l-blue-500"
                        : ""
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {/* Avatar with notification type indicator */}
                      <div className="relative">
                        <Avatar
                          className={`h-10 w-10 border-2 ${getNotificationColor(
                            notification?.type
                          )}`}
                        >
                          <AvatarImage
                            src={
                              notification?.fromUser?.profilePicture ||
                              "/placeholder.svg?height=40&width=40"
                            }
                            alt={notification?.fromUser?.username}
                          />
                          <AvatarFallback className="text-xs font-medium">
                            {notification?.fromUser?.username
                              ?.substring(0, 2)
                              .toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        {/* Notification type icon */}
                        <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-1 border border-gray-200">
                          {getNotificationIcon(notification?.type)}
                        </div>
                      </div>

                      {/* Notification content */}
                      {renderNotificationContent(notification)}

                      {/* Unread indicator */}
                      {!notification?.isRead && (
                        <div className="h-2 w-2 rounded-full bg-blue-500 shrink-0 mt-2"></div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {notifications?.length > 0 && (
            <div className="p-4 border-t bg-gray-50/50">
              <Button
                variant="ghost"
                className="w-full text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                onClick={() => {
                  // Add mark all as read functionality
                  console.log("Mark all as read");
                }}
              >
                Mark all as read
              </Button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
