import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useDebounce } from "use-debounce";

export interface UserManagement {
  _id: string;
  username: string;
  email: string;
  profilePicture: string;
  postsCount: number;
  status: boolean;
  followers: number;
  createdAt: string; // or `Date` if you parse it
}

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Search, MoreHorizontal, Ban, Shield, Mail } from "lucide-react";
import {
  useGetAllUsersQuery,
  useSuspendUserMutation,
  useUserCountsQuery,
  useSearchUsersQuery,
} from "@/services/adminApi";

export const UsersSection = () => {
  const {
    data: getAllUsers,
    isLoading,
    refetch,
  } = useGetAllUsersQuery(undefined);
  const [suspendUser] = useSuspendUserMutation();

  const [input, setInput] = useState("");
  const [debouncedInput] = useDebounce(input, 100);
  const { data: usersData } = useSearchUsersQuery(debouncedInput, {
    skip: debouncedInput.length === 0,
  });
  const [users, setUsers] = useState(getAllUsers?.allUsers);
  const { data } = useUserCountsQuery(undefined);

  useEffect(() => {
    if (input.length >0) {
      setUsers(usersData?.user);
    }else if(input.length == 0) {
      setUsers(getAllUsers?.allUsers)
    }
  }, [input]);

  
  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "suspended":
        return "bg-red-100 text-red-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleSuspendUser = async (userId: string, status: boolean) => {
    await suspendUser({ userId, status: !status }).unwrap();
    await refetch();
  };

  if(isLoading) {
    return <p>User are loading</p>
  }
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-600 mt-2">
            Manage and moderate user accounts
          </p>
        </div>
        <Button>Add New User</Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">
              {data?.userCount ?? 0}
            </div>
            <div className="text-sm text-gray-600">Active Users</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-red-600">
              {data?.suspendedUser ?? 0}
            </div>
            <div className="text-sm text-gray-600">Suspended</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-yellow-600">89</div>
            <div className="text-sm text-gray-600">Pending Review</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600">2,847</div>
            <div className="text-sm text-gray-600">Verified Users</div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle>All Users</CardTitle>
          <CardDescription>
            A comprehensive list of all registered users
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-6">
            <div className="relative flex-1">
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={16}
              />
              <Input
                placeholder="Search users by name or email..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline">Filter</Button>
            <Button variant="outline">Export</Button>
          </div>

          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Join Date</TableHead>
                  <TableHead>Posts</TableHead>
                  <TableHead>Followers</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users?.map((user: UserManagement) => (
                  <TableRow key={user._id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={user.profilePicture} />
                          <AvatarFallback>
                            {user.username
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="flex items-center gap-2">
                            <div className="font-medium">{user.username}</div>
                            {/* {user.verified && (
                              <Shield className="h-4 w-4 text-blue-500" />
                            )} */}
                          </div>
                          <div className="text-sm text-gray-500">
                            {user.email}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={
                          user.status
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }
                      >
                        {user.status ? "active" : "suspended"}
                      </Badge>
                    </TableCell>
                    <TableCell>{user.createdAt}</TableCell>
                    <TableCell>{user.postsCount}</TableCell>
                    <TableCell>{user.followers.toLocaleString()}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Mail className="mr-2 h-4 w-4" />
                            Send Message
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Shield className="mr-2 h-4 w-4" />
                            Verify User
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-red-600"
                            onClick={() =>
                              handleSuspendUser(user._id, user.status)
                            }
                          >
                            <Ban className="mr-2 h-4 w-4" />
                            {user.status ? "Block" : "Unblock"}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
