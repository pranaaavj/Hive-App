import { Loader2, UserMinus, UserPlus, X } from "lucide-react";
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { ScrollArea } from "../ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { useEffect, useState } from "react";
import {
  useGetFollowingUsersQuery,
  useGetFollowersQuery,
} from "@/services/authApi";
import { useNavigate } from "react-router-dom";

interface FollowingFollowersModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: "followers" | "following";
  userId: string;
}

export function FollowingFollowersModal({
  isOpen,
  onClose,
  type,
  userId,
}: FollowingFollowersModalProps) {
  const title = type === "followers" ? "followers" : "following";
  const [users, setUsers] = useState([])
  const navigate = useNavigate()
  const { data: followers, isLoading: followersLoading } = useGetFollowersQuery(
    userId,
    { skip: type != "followers" }
  );
  const { data: following, isLoading: followingLoading, } =
    useGetFollowingUsersQuery(userId, { skip: type != "following" });

    const isLoading = type === 'followers' ? followersLoading : followingLoading;

    useEffect(() => {
        if(type == "followers" && followers) {
            setUsers(followers)
        } else if(type == "following" && following) {
            setUsers(following)
        }
    }, [type, followers, following])

    const handleClose = () => {
        setUsers([])
        onClose()
      }



  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <Button variant="ghost" size="sm" onClick={handleClose} className="h-8 w-8 p-0">
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>

        <div className="h-[400px]">
  {isLoading ? (
    <div className="flex items-center justify-center h-full">
      <div className="flex flex-col items-center space-y-2">
        <Loader2 className="h-6 w-6 animate-spin" />
        <p className="text-sm text-muted-foreground">
          Loading {type}...
        </p>
      </div>
    </div>
  ) : ( 
    <ScrollArea className="h-full pr-4">
      <div className="space-y-4">
        {users.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>No {type} yet</p>
          </div>
        ) : (
          users?.map((user) => (
            <div
              key={user?._id}
              className="flex items-center justify-between"
            >
              <div onClick={() => {
                onClose()
                navigate(`/profile/${user._id}`)}}
                
                className="flex items-center space-x-3">
                <Avatar>
                  <AvatarImage
                    src={user?.profilePicture || "/placeholder.svg"}
                    alt={user?.username}
                  />
                  <AvatarFallback>
                    {user?.username
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium leading-none">
                    {user?.username}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {user?.username}
                  </p>
                </div>
              </div>

              {/* <Button
                variant={user.isFollowing ? "outline" : "default"}
                size="sm"
                onClick={() => handleFollowToggle(user.id)}
                disabled={actionLoading === user.id}
                className="ml-auto"
              >
                {actionLoading === user.id ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : type === "following" ? (
                  <>
                    <UserMinus className="w-4 h-4 mr-1" />
                    Unfollow
                  </>
                ) : user.isFollowing ? (
                  <>
                    <UserMinus className="w-4 h-4 mr-1" />
                    Unfollow
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4 mr-1" />
                    Follow Back
                  </>
                )}
              </Button> */}
            </div>
          ))
        )}
      </div>
    </ScrollArea>
  )}
</div>

      </DialogContent>
    </Dialog>
  );
}
