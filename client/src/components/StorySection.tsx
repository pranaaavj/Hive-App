"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { PlusCircle } from "lucide-react"
import { useMemo, useState } from "react"
import { AddStoryModal } from "./modals/AddStroryModal"
import { useGetStoriesQuery, useMarkStorySeenMutation, useMyStoriesQuery } from "@/services/postApi"
import { StoriesModal } from "./modals/StoriesModal"

export type Story = {
  isSeen: boolean
  // add other fields if needed
}

export function StorySection() {
  const [addStoryModalOpen, setAddStoryModalOpen] = useState(false)
  const { data: stories, isLoading, refetch } = useGetStoriesQuery(undefined)
  const { data: myStories, isLoading: myStoryLoading, refetch: refetchMyStories } = useMyStoriesQuery(undefined)
  const [isStoriesOpen, setIsStoriesOpen] = useState(false)
  const [userIndex, setUserIndex] = useState(0)
  const [markStorySeen] = useMarkStorySeenMutation()

  const handleAddStory = () => {
    setAddStoryModalOpen(true)
  }

  const handleOpenStories = (index: number) => {
    setUserIndex(index)
    setIsStoriesOpen(true)
  }

  const combinedStories = useMemo(() => {
    if (!myStories || !stories) return []
    return [
      {
        userId: myStories.userId,
        username: myStories.username,
        profilePicture: myStories.profilePicture,
        stories: myStories.stories,
      },
      ...stories,
    ]
  }, [myStories, stories])

  const handleCloseStories = async () => {
    setIsStoriesOpen(false)
    setUserIndex(0)
    try {
      await Promise.all([refetch(), refetchMyStories()])
    } catch (error) {
      console.error("Error while refetching stories:", error)
    }
  }

  const handleMarkStorySeen = async (storyId: string) => {
    try {
      await markStorySeen({ storyId }).unwrap()
    } catch (error) {
      console.error("Failed to mark story as seen:", error)
    }
  }

  if (isLoading || myStoryLoading) {
    return (
      <section className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-3 lg:p-4">
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-amber-500"></div>
          </div>
        </div>
      </section>
    )
  }

  return (
    <>
      <section className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-3 lg:p-4">
          <ScrollArea className="w-full">
            <div className="flex gap-3 lg:gap-4 py-2">
              {/* Your Story */}
              <div className="flex flex-col items-center space-y-1 w-16 lg:w-20 flex-shrink-0">
                <div className="relative">
                  <div
                    className={`w-12 h-12 lg:w-16 lg:h-16 rounded-full p-[2px] cursor-pointer ${
                      myStories?.stories?.length > 0
                        ? myStories?.stories?.every((story: Story) => story?.isSeen)
                          ? "bg-gray-300"
                          : "bg-gradient-to-br from-amber-300 to-amber-500"
                        : ""
                    }`}
                    onClick={() => handleOpenStories(0)}
                  >
                    <Avatar className="w-full h-full border-2 border-white">
                      <AvatarImage src={myStories?.profilePicture || "/placeholder.svg"} alt="Your Story" />
                      <AvatarFallback className="text-xs lg:text-sm">
                        {myStories?.username?.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  <div
                    onClick={handleAddStory}
                    className="absolute bottom-0 right-0 bg-white rounded-full p-0.5 shadow-md cursor-pointer"
                  >
                    <PlusCircle className="w-4 h-4 lg:w-5 lg:h-5 text-amber-500" />
                  </div>
                </div>
                <span className="text-xs font-medium text-center truncate w-full">Your Story</span>
              </div>

              {/* Following Users */}
              {stories?.map((user, index) => (
                <div key={user?.userId} className="flex flex-col items-center space-y-1 w-16 lg:w-20 flex-shrink-0">
                  <div
                    className={`w-12 h-12 lg:w-16 lg:h-16 rounded-full p-[2px] cursor-pointer ${
                      user?.stories?.every((story) => story?.isSeen)
                        ? "bg-gray-300"
                        : "bg-gradient-to-br from-amber-300 to-amber-500"
                    }`}
                    onClick={() => handleOpenStories(index + 1)}
                  >
                    <Avatar className="w-full h-full border-2 border-white">
                      <AvatarImage src={user?.profilePicture || "/placeholder.svg"} alt={user?.username} />
                      <AvatarFallback className="text-xs lg:text-sm">
                        {user?.username?.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  <span className="text-xs font-medium text-center truncate w-full">{user?.username}</span>
                </div>
              ))}
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </div>
      </section>

      <AddStoryModal isOpen={addStoryModalOpen} setIsOpen={setAddStoryModalOpen} />
      {stories && (
        <StoriesModal
          isOpen={isStoriesOpen}
          onClose={handleCloseStories}
          userStoriesData={combinedStories}
          initialUserIndex={userIndex}
          initialStoryIndex={0}
          onMarkStorySeen={handleMarkStorySeen}
        />
      )}
    </>
  )
}
