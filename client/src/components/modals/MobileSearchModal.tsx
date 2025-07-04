"use client"

import { useState, useEffect } from "react"
import { Search, X, ArrowLeft } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"

interface SearchUser {
  _id: string
  username: string
  profilePicture?: string
  followers: number
}

interface MobileSearchModalProps {
  isOpen: boolean
  onClose: () => void
  users: SearchUser[]
  isLoading: boolean
  query: string
  setQuery: (query: string) => void
  navigate: (path: string) => void
}

export function MobileSearchModal({
  isOpen,
  onClose,
  users,
  isLoading,
  query,
  setQuery,
  navigate,
}: MobileSearchModalProps) {
  const [recentSearches, setRecentSearches] = useState<SearchUser[]>([])

  useEffect(() => {
    // Load recent searches from localStorage
    const saved = localStorage.getItem("recentSearches")
    if (saved) {
      setRecentSearches(JSON.parse(saved))
    }
  }, [])

  const handleUserClick = (user: SearchUser) => {
    // Add to recent searches
    const updatedRecent = [user, ...recentSearches.filter((u) => u._id !== user._id)].slice(0, 5)
    setRecentSearches(updatedRecent)
    localStorage.setItem("recentSearches", JSON.stringify(updatedRecent))

    setQuery("")
    onClose()
    navigate(`/profile/${user._id}`)
  }

  const clearRecentSearches = () => {
    setRecentSearches([])
    localStorage.removeItem("recentSearches")
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 bg-white">
      {/* Header */}
      <div className="flex items-center gap-4 p-4 border-b border-gray-200 bg-white sticky top-0">
        <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 transition-colors">
          <ArrowLeft className="h-5 w-5 text-gray-600" />
        </button>

        <div className="flex-1 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search users..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-100 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white"
            autoFocus
          />
          {query && (
            <button onClick={() => setQuery("")} className="absolute inset-y-0 right-0 pr-3 flex items-center">
              <X className="h-4 w-4 text-gray-400" />
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Loading State */}
        {isLoading && (
          <div className="flex justify-center items-center py-8">
            <div className="h-6 w-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}

        {/* Search Results */}
        {query.trim() !== "" && !isLoading && (
          <div className="p-4">
            {users.length === 0 ? (
              <div className="text-center py-8">
                <Search className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 text-sm">No users found for "{query}"</p>
              </div>
            ) : (
              <div className="space-y-1">
                <h3 className="text-sm font-semibold text-gray-800 mb-3">Search Results</h3>
                {users.map((user) => (
                  <div
                    key={user._id}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={() => handleUserClick(user)}
                  >
                    <Avatar className="h-12 w-12 border border-gray-200">
                      <AvatarImage src={user.profilePicture || "/placeholder.svg"} alt={user.username} />
                      <AvatarFallback className="text-sm font-medium">
                        {user.username.substring(0, 1).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm truncate">{user.username}</p>
                      <p className="text-xs text-gray-500">{user.followers} followers</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Recent Searches */}
        {query.trim() === "" && !isLoading && (
          <div className="p-4">
            {recentSearches.length > 0 ? (
              <div className="space-y-1">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-gray-800">Recent</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearRecentSearches}
                    className="text-xs text-amber-600 hover:text-amber-700 hover:bg-amber-50 h-auto p-1"
                  >
                    Clear all
                  </Button>
                </div>
                {recentSearches.map((user) => (
                  <div
                    key={user._id}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={() => handleUserClick(user)}
                  >
                    <Avatar className="h-12 w-12 border border-gray-200">
                      <AvatarImage src={user.profilePicture || "/placeholder.svg"} alt={user.username} />
                      <AvatarFallback className="text-sm font-medium">
                        {user.username.substring(0, 1).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm truncate">{user.username}</p>
                      <p className="text-xs text-gray-500">{user.followers} followers</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Search className="h-16 w-16 text-gray-200 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Search for users</h3>
                <p className="text-gray-500 text-sm">Find friends and discover new accounts</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
