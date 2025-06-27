import { Link } from "react-router-dom"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

export function RightSidebar() {
  return (
    <div className="space-y-4 px-5 pt-5">
      {/* <Card className="shadow-sm border-amber-100">
        <CardHeader className="pb-2 pt-3 px-3">
          <h3 className="font-semibold text-base">Your Profile</h3>
        </CardHeader>
        <CardContent className="px-3 pb-3">
          <div className="flex items-center gap-3">
            <Avatar className="h-14 w-14 border-2 border-amber-200">
              <AvatarImage src="/placeholder.svg?height=80&width=80" alt="Profile" />
              <AvatarFallback>PR</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold text-sm">username</p>
              <p className="text-xs text-gray-500">Full Name</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 mt-3 text-center">
            <div className="bg-amber-50 p-2 rounded-md">
              <p className="font-semibold text-sm">156</p>
              <p className="text-xs text-gray-500">Posts</p>
            </div>
            <div className="bg-amber-50 p-2 rounded-md">
              <p className="font-semibold text-sm">1.2K</p>
              <p className="text-xs text-gray-500">Followers</p>
            </div>
            <div className="bg-amber-50 p-2 rounded-md">
              <p className="font-semibold text-sm">568</p>
              <p className="text-xs text-gray-500">Following</p>
            </div>
          </div>
        </CardContent>
      </Card> */}

      <Card className="shadow-sm border-amber-100">
        <CardHeader className="pb-2 pt-3 px-3">
          <h3 className="font-semibold text-base">Suggested for you</h3>
        </CardHeader>
        <CardContent className="space-y-3 px-3 pb-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Avatar className="h-8 w-8 border border-amber-100">
                  <AvatarImage src={`/placeholder.svg?height=40&width=40&text=User${i}`} alt={`User ${i}`} />
                  <AvatarFallback>U{i}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-xs font-medium">user{i}</p>
                  <p className="text-xs text-gray-500">Followed by user{i + 1}</p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="text-xs h-7 text-amber-600 hover:text-amber-700 border-amber-200 hover:bg-amber-50"
              >
                Follow
              </Button>
            </div>
          ))}

          <Button
            variant="ghost"
            className="w-full text-xs text-amber-600 hover:text-amber-700 hover:bg-amber-50 mt-1 h-7"
          >
            See More
          </Button>
        </CardContent>
      </Card>

      <div className="text-xs text-gray-500 space-y-2 p-3">
        <div className="flex flex-wrap gap-x-2 gap-y-1">
          <Link to="#" className="hover:underline">
            About
          </Link>
          <Link to="#" className="hover:underline">
            Help
          </Link>
          <Link to="#" className="hover:underline">
            Press
          </Link>
          <Link to="#" className="hover:underline">
            API
          </Link>
          <Link to="#" className="hover:underline">
            Jobs
          </Link>
          <Link to="#" className="hover:underline">
            Privacy
          </Link>
          <Link to="#" className="hover:underline">
            Terms
          </Link>
        </div>
        <p>© 2025 HIVE</p>
      </div>
    </div>
  )
}
