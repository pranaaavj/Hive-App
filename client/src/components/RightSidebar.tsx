import { Link } from "react-router-dom"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

export function RightSidebar() {
  return (
    <div className="space-y-6 px-6 pt-6 w-full">
      <Card className="shadow-sm border-gray-100">
        <CardHeader className="pb-3 pt-4 px-4">
          <h3 className="font-semibold text-base">Suggested for you</h3>
        </CardHeader>
        <CardContent className="space-y-4 px-4 pb-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10 border border-gray-200">
                  <AvatarImage src={`/placeholder.svg?height=40&width=40&text=User${i}`} alt={`User ${i}`} />
                  <AvatarFallback>U{i}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium">user{i}</p>
                  <p className="text-xs text-gray-500">Followed by user{i + 1}</p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="text-xs h-8 text-amber-600 hover:text-amber-700 border-amber-200 hover:bg-amber-50 bg-transparent"
              >
                Follow
              </Button>
            </div>
          ))}
          <Button
            variant="ghost"
            className="w-full text-xs text-amber-600 hover:text-amber-700 hover:bg-amber-50 mt-2 h-8"
          >
            See More
          </Button>
        </CardContent>
      </Card>

      <div className="text-xs text-gray-500 space-y-3 p-4">
        <div className="flex flex-wrap gap-x-3 gap-y-2">
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
