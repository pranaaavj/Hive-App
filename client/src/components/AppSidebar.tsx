"use client"

import type React from "react"

import { useState } from "react"
import { Link } from "react-router-dom"
import { Home, Compass, Bell, Send, PlusSquare, User, BookmarkIcon, Settings, LogOut, Search } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { NotificationsSidebar } from "./NotificartionsSidebar"

interface AppSidebarProps {
  onCreateClick?: () => void
}

export function AppSidebar({ onCreateClick }: AppSidebarProps) {
  const [notificationsOpen, setNotificationsOpen] = useState(false)

  const toggleNotifications = (e: React.MouseEvent) => {
    e.preventDefault()
    setNotificationsOpen(!notificationsOpen)
  }

  return (
    <>
      {/* Notifications Sidebar */}
      <NotificationsSidebar isOpen={notificationsOpen} onClose={() => setNotificationsOpen(false)} />

      {/* Main Sidebar */}
      <Sidebar variant="sidebar" collapsible="icon" className="border-r border-amber-200 bg-white w-64">
        <SidebarHeader className="p-4">
          <div className="flex justify-center items-center gap-3 px-2 mb-4">
            <img className="h-[100px] self-center" src="/logo/hive-logo.png" alt="Hive Logo" />
          </div>

          <div className="relative mt-2">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search"
              className="pl-10 pr-4 py-2 w-full bg-gray-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>
        </SidebarHeader>

        <SidebarContent className="ml-5">
          <SidebarMenu className="space-y-2">
            <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip="Home" className="py-3 text-sm">
                <Link to="/home" className="flex items-center gap-3 font-medium">
                  <Home className="h-5 w-5" />
                  <span>Home</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>

            <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip="Explore" className="py-3 text-sm">
                <Link to="/explore" className="flex items-center gap-3 font-medium">
                  <Compass className="h-5 w-5" />
                  <span>Explore</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>

            <SidebarMenuItem>
              <SidebarMenuButton tooltip="Notifications" className="py-3 text-sm" onClick={toggleNotifications}>
                <div className="flex items-center gap-3 font-medium cursor-pointer">
                  <Bell className="h-5 w-5" />
                  <span>Notifications</span>
                  {/* Optional: Add notification indicator */}
                  <span className="ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-amber-500 text-[10px] font-medium text-white">
                    3
                  </span>
                </div>
              </SidebarMenuButton>
            </SidebarMenuItem>

            <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip="Messages" className="py-3 text-sm">
                <Link to="/messages" className="flex items-center gap-3 font-medium">
                  <Send className="h-5 w-5" />
                  <span>Messages</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>

            <SidebarMenuItem>
              <SidebarMenuButton tooltip="Create" className="py-3 text-sm" onClick={onCreateClick}>
                <div className="flex items-center gap-3 font-medium cursor-pointer">
                  <PlusSquare className="h-5 w-5" />
                  <span>Create</span>
                </div>
              </SidebarMenuButton>
            </SidebarMenuItem>

            <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip="Profile" className="py-3 text-sm">
                <Link to="/profile" className="flex items-center gap-3 font-medium">
                  <User className="h-5 w-5" />
                  <span>Profile</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>

            <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip="Saved" className="py-3 text-sm">
                <Link to="/saved" className="flex items-center gap-3 font-medium">
                  <BookmarkIcon className="h-5 w-5" />
                  <span>Saved</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarContent>

        <SidebarFooter className="p-4">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip="Settings" className="py-3 text-sm">
                <Link to="/settings" className="flex items-center gap-3 font-medium">
                  <Settings className="h-5 w-5" />
                  <span>Settings</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>

            <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip="Logout" className="py-3 text-sm">
                <Link to="/logout" className="flex items-center gap-3 font-medium">
                  <LogOut className="h-5 w-5" />
                  <span>Logout</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>

          <div className="p-3 mt-3 bg-amber-50 rounded-lg">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10 border-2 border-amber-200">
                <AvatarImage src="/placeholder.svg?height=40&width=40" alt="Profile" />
                <AvatarFallback>PR</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold text-sm">username</p>
                <p className="text-xs text-gray-500">Full Name</p>
              </div>
            </div>
          </div>
        </SidebarFooter>
      </Sidebar>
    </>
  )
}
