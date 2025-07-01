"use client"

import type React from "react"

import { useState } from "react"
import { Outlet, useLocation, matchPath } from "react-router-dom"
import { AppSidebar } from "../AppSidebar"
import { RightSidebar } from "../RightSidebar"
import { PostModal } from "../modals/PostModal"
import { SidebarProvider } from "../ui/sidebar"
import { useWindowSize } from "@/hooks/useWindowSize"

export const MainLayout: React.FC = () => {
  const [isCreatePostModalOpen, setIsCreatePostModalOpen] = useState(false)
  const location = useLocation()
  const { width } = useWindowSize()

  const pathsWithoutRightSidebar = [
    "/profile/:userId",
    "/messages/:userId",
    "/profile/edit/:userId",
    "/messages",
    "/settings",
  ]

  const minimalSidebarPages = ["/create", "/messages", "/messages/:userId", "/settings"]

  const isMinimalPage = minimalSidebarPages.some((path) => matchPath({ path, end: true }, location.pathname))

  const isMinimalSidebarPath = minimalSidebarPages.some((path) => matchPath({ path, end: true }, location.pathname))

  const isPathWithoutRightSidebar = pathsWithoutRightSidebar.some((path) =>
    matchPath({ path, end: true }, location.pathname),
  )

  const showRightSidebar = !isPathWithoutRightSidebar

  // Calculate sidebar width based on minimal mode and screen size
  const isDesktop = width >= 1024
  const sidebarWidth = isDesktop ? (isMinimalSidebarPath ? 80 : 256) : 0
  const sidebarWidthClass = isMinimalSidebarPath ? "w-20" : "w-64"

  return (
    <SidebarProvider>
      <main className="relative min-h-screen w-full bg-gray-50">
        {/* Desktop Left Sidebar */}
        <div
          className={`hidden lg:flex fixed left-0 top-0 h-full z-30 ${sidebarWidthClass} bg-white border-r border-gray-200`}
        >
          <AppSidebar onCreateClick={() => setIsCreatePostModalOpen(true)} minimalMode={isMinimalSidebarPath} />
        </div>

        {/* Mobile Bottom Navigation */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-gray-200">
          <AppSidebar onCreateClick={() => setIsCreatePostModalOpen(true)} minimalMode={false} isMobile={true} />
        </div>

        {/* Main Content */}
        <div
          className={`
          min-h-screen
          ${isMinimalPage ? "" : "px-4 sm:px-6 lg:px-8 py-4 lg:py-6"}
          ${showRightSidebar && !isMinimalPage ? "lg:mr-80" : ""}
          pb-20 lg:pb-6
          transition-all duration-300 ease-in-out
        `}
          style={{
            marginLeft: `${sidebarWidth}px`,
          }}
        >
          {/* Content wrapper - only constrain width for non-minimal pages */}
          <div className={isMinimalPage ? "w-full h-full" : "max-w-lg mx-auto lg:max-w-2xl"}>
            <Outlet />
          </div>
        </div>

        {/* Desktop Right Sidebar - only show for non-minimal pages */}
        {showRightSidebar && !isMinimalPage && isDesktop && (
          <div className="hidden lg:flex fixed top-0 right-0 w-80 h-full bg-white border-l border-gray-200 z-20">
            <RightSidebar />
          </div>
        )}

        {/* Post Modal */}
        <PostModal open={isCreatePostModalOpen} onOpenChange={setIsCreatePostModalOpen} />
      </main>
    </SidebarProvider>
  )
}
