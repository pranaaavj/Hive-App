// src/components/StorySection.tsx
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { PlusCircle } from "lucide-react";
import { Story } from "@/types/auth";

interface StorySectionProps {
  stories: Story[];
}

export function StorySection({ stories }: StorySectionProps) {
  return (
    <section className="bg-white rounded-xl shadow-sm mb-4">
      <div className="p-3">
        <ScrollArea className="w-full">
          <div className="flex gap-4 py-2">
            <div className="flex flex-col items-center space-y-1 w-20">
              <div className="relative">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-200 to-amber-500 p-[2px]">
                  <Avatar className="w-full h-full border-2 border-white">
                    <AvatarImage src="/placeholder.svg?height=80&width=80" alt="Your Story" />
                    <AvatarFallback>YS</AvatarFallback>
                  </Avatar>
                </div>
                <div className="absolute bottom-0 right-0 bg-white rounded-full p-0.5 shadow-md">
                  <PlusCircle className="w-5 h-5 text-amber-500" />
                </div>
              </div>
              <span className="text-xs font-medium text-center truncate w-full">Your Story</span>
            </div>

            {stories.slice(1).map((story) => (
              <div key={story.id} className="flex flex-col items-center space-y-1 w-20">
                <div
                  className={`w-16 h-16 rounded-full ${
                    story.hasUnseenStory ? "bg-gradient-to-br from-amber-300 to-amber-500" : "bg-gray-200"
                  } p-[2px]`}
                >
                  <Avatar className="w-full h-full border-2 border-white">
                    <AvatarImage src={story.avatar || "/placeholder.svg"} alt={story.username} />
                    <AvatarFallback>{story.username.substring(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                </div>
                <span className="text-xs font-medium text-center truncate w-full">{story.username}</span>
              </div>
            ))}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </div>
    </section>
  );
}