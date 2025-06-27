import type React from "react";
import { useState, useRef, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  Home,
  Compass,
  Bell,
  Send,
  PlusSquare,
  User,
  BookmarkIcon,
  Settings,
  LogOut,
  Search,
  X,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { NotificationsSidebar } from "./NotificationsSidebar";
import { useSearchUsersQuery } from "@/services/authApi";
import { useAppSelector } from "@/hooks/reduxHooks";
import { useLogoutUserMutation } from "@/services/authApi";
import { useDispatch } from "react-redux";
import { logout } from "@/redux/slices/userSlice";
import { socket } from "@/lib/socket";
import { useUsernameAndProfileQuery } from "@/services/authApi";

interface AppSidebarProps {
  onCreateClick?: () => void;
  minimalMode?: boolean; // New prop to control minimal mode
}

// Define pages that should use minimal mode
const MINIMAL_MODE_PAGES = [
  "/create",
  "/messages",
  "/settings",
  "/edit-profile",
];

export function AppSidebar({ onCreateClick, minimalMode }: AppSidebarProps) {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();
  const userId = useAppSelector((state) => state.user.user?.id);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const { data: users = [], isLoading } = useSearchUsersQuery(query, {
    skip: debouncedQuery.trim() === "",
  });
  const { data: userDetails } = useUsernameAndProfileQuery(undefined);
  const [logoutUser] = useLogoutUserMutation();

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(query);
    }, 300);

    return () => clearTimeout(handler);
  }, [query]);

  const isMinimalMode =
    minimalMode || MINIMAL_MODE_PAGES.includes(location.pathname);

  useEffect(() => {
    setShowResults(debouncedQuery.trim() !== "");
  }, [debouncedQuery]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setShowResults(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const toggleNotifications = (e: React.MouseEvent) => {
    e.preventDefault();
    setNotificationsOpen(!notificationsOpen);
  };

  const handleLogout = async () => {
    try {
      await logoutUser().unwrap();
      dispatch(logout());
      socket.disconnect();
      navigate("/login");
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  return (
    <>
      {/* Notifications Sidebar */}
      <NotificationsSidebar
        isOpen={notificationsOpen}
        onClose={() => setNotificationsOpen(false)}
      />

      {/* Main Sidebar */}
      <Sidebar
        variant="sidebar"
        collapsible="icon"
        className={`border-r border-amber-200 bg-white h-full ${
          isMinimalMode ? "w-20" : "w-64"
        }`}
      >
        {/* Conditional Header - only show in full mode */}
        {!isMinimalMode && (
          <SidebarHeader className="p-4">
            <div className="flex justify-center items-center gap-3 px-2 mb-4">
              <img
                className="h-[100px] self-center"
                src="/logo/hive-logo.png"
                alt="Hive Logo"
              />
            </div>

            <div className="relative mt-2 flex flex-col" ref={searchRef}>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search by username"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 w-full bg-gray-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                />

                {/* User search results modal */}
                {showResults && (
                  <div
                    className="absolute left-full ml-6 top-0 z-50 bg-white rounded-lg shadow-xl border border-gray-200 w-72 max-h-[400px] overflow-hidden animate-in fade-in duration-200"
                    style={{
                      boxShadow:
                        "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)",
                    }}
                  >
                    <div className="sticky top-0 bg-white z-10">
                      <div className="flex items-center justify-between p-3 border-b border-gray-100">
                        <h3 className="text-sm font-semibold text-gray-800">
                          Search Results
                        </h3>
                        <button
                          onClick={() => setShowResults(false)}
                          className="p-1 rounded-full hover:bg-gray-100 transition-colors"
                          aria-label="Close search results"
                        >
                          <X className="h-4 w-4 text-gray-500" />
                        </button>
                      </div>

                      {isLoading && (
                        <div className="flex justify-center items-center py-4">
                          <div className="h-5 w-5 border-2 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
                        </div>
                      )}
                    </div>

                    <div className="overflow-y-auto max-h-[350px]">
                      {!isLoading && users.length === 0 && (
                        <div className="p-4 text-center text-gray-500 text-sm">
                          No users found matching "{query}"
                        </div>
                      )}

                      {users.map((user) => (
                        <div
                          key={user._id}
                          className="p-3 hover:bg-amber-50 transition-colors flex items-center gap-3 cursor-pointer border-b border-gray-50 last:border-b-0"
                          onClick={() => {
                            setQuery("");
                            setShowResults(false);
                            navigate(`/profile/${user._id}`);
                          }}
                        >
                          <div className="flex">
                            <Avatar className="h-10 w-10 border border-amber-200">
                              <AvatarImage
                                src={
                                  user.profilePicture ||
                                  "/placeholder.svg?height=40&width=40"
                                }
                                alt={user.username}
                              />
                              <AvatarFallback>
                                {user.username.substring(0, 1).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div className="ml-6 flex-1 min-w-0">
                              <div className="flex gap-1 flex-col items-center text-xs">
                                <p className="font-semibold text-sm truncate">
                                  {user.username}
                                </p>
                                <span>{user.followers} followers</span>
                                {user.followers > 0 && (
                                  <span className="inline-flex items-center ml-2 px-1.5 py-0.5 rounded-full text-[10px] bg-amber-100 text-amber-800">
                                    Popular
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="sticky bottom-0 bg-gray-50 p-2 text-xs text-center text-gray-500 border-t border-gray-100">
                      Click on a user to view their profile
                    </div>
                  </div>
                )}
              </div>
            </div>
          </SidebarHeader>
        )}

        {/* Minimal Mode Logo - Show only in minimal mode */}
        {isMinimalMode && (
          <SidebarHeader className="p-4 flex justify-center">
            <div className="flex justify-center items-center">
              <img
                className="h-12 w-12 object-contain"
                src="/logo/hive-logo.png"
                alt="Hive Logo"
              />
            </div>
          </SidebarHeader>
        )}

        <SidebarContent className={isMinimalMode ? "px-2 pt-2" : "ml-5"}>
          <SidebarMenu className="space-y-1">
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                tooltip="Home"
                className={`${
                  isMinimalMode
                    ? "h-14 w-14 mx-auto flex items-center justify-center rounded-xl hover:bg-amber-50 transition-colors"
                    : "py-3 text-sm"
                }`}
              >
                <Link
                  to="/home"
                  className={`flex items-center gap-3 font-medium ${
                    isMinimalMode ? "justify-center" : ""
                  }`}
                >
                  <Home className={isMinimalMode ? "h-6 w-6" : "h-5 w-5"} />
                  {!isMinimalMode && <span>Home</span>}
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>

            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                tooltip="Explore"
                className={`${
                  isMinimalMode
                    ? "h-14 w-14 mx-auto flex items-center justify-center rounded-xl hover:bg-amber-50 transition-colors"
                    : "py-3 text-sm"
                }`}
              >
                <Link
                  to="/explore"
                  className={`flex items-center gap-3 font-medium ${
                    isMinimalMode ? "justify-center" : ""
                  }`}
                >
                  <Compass className={isMinimalMode ? "h-6 w-6" : "h-5 w-5"} />
                  {!isMinimalMode && <span>Explore</span>}
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>

            <SidebarMenuItem>
              <SidebarMenuButton
                tooltip="Notifications"
                className={`${
                  isMinimalMode
                    ? "h-14 w-14 mx-auto flex items-center justify-center rounded-xl hover:bg-amber-50 transition-colors"
                    : "py-3 text-sm"
                }`}
                onClick={toggleNotifications}
              >
                <div
                  className={`flex items-center gap-3 font-medium cursor-pointer ${
                    isMinimalMode ? "justify-center relative" : ""
                  }`}
                >
                  <Bell className={isMinimalMode ? "h-6 w-6" : "h-5 w-5"} />
                  {!isMinimalMode && <span>Notifications</span>}
                  {/* Notification indicator */}
                  <span
                    className={`${
                      isMinimalMode ? "absolute -top-2 -right-2" : "ml-auto"
                    } flex h-5 w-5 items-center justify-center rounded-full bg-amber-500 text-[10px] font-medium text-white`}
                  >
                    3
                  </span>
                </div>
              </SidebarMenuButton>
            </SidebarMenuItem>

            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                tooltip="Messages"
                className={`${
                  isMinimalMode
                    ? "h-14 w-14 mx-auto flex items-center justify-center rounded-xl hover:bg-amber-50 transition-colors"
                    : "py-3 text-sm"
                }`}
              >
                <Link
                  to="/messages"
                  className={`flex items-center gap-3 font-medium ${
                    isMinimalMode ? "justify-center" : ""
                  }`}
                >
                  <Send className={isMinimalMode ? "h-6 w-6" : "h-5 w-5"} />
                  {!isMinimalMode && <span>Messages</span>}
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>

            <SidebarMenuItem>
              <SidebarMenuButton
                tooltip="Create"
                className={`${
                  isMinimalMode
                    ? "h-14 w-14 mx-auto flex items-center justify-center rounded-xl hover:bg-amber-50 transition-colors"
                    : "py-3 text-sm"
                }`}
                onClick={onCreateClick}
              >
                <div
                  className={`flex items-center gap-3 font-medium cursor-pointer ${
                    isMinimalMode ? "justify-center" : ""
                  }`}
                >
                  <PlusSquare
                    className={isMinimalMode ? "h-6 w-6" : "h-5 w-5"}
                  />
                  {!isMinimalMode && <span>Create</span>}
                </div>
              </SidebarMenuButton>
            </SidebarMenuItem>

            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                tooltip="Profile"
                className={`${
                  isMinimalMode
                    ? "h-14 w-14 mx-auto flex items-center justify-center rounded-xl hover:bg-amber-50 transition-colors"
                    : "py-3 text-sm"
                }`}
              >
                <Link
                  to={`/profile/${userId}`}
                  className={`flex items-center gap-3 font-medium ${
                    isMinimalMode ? "justify-center" : ""
                  }`}
                >
                  <User className={isMinimalMode ? "h-6 w-6" : "h-5 w-5"} />
                  {!isMinimalMode && <span>Profile</span>}
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>

            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                tooltip="Saved"
                className={`${
                  isMinimalMode
                    ? "h-14 w-14 mx-auto flex items-center justify-center rounded-xl hover:bg-amber-50 transition-colors"
                    : "py-3 text-sm"
                }`}
              >
                <Link
                  to="/saved"
                  className={`flex items-center gap-3 font-medium ${
                    isMinimalMode ? "justify-center" : ""
                  }`}
                >
                  <BookmarkIcon
                    className={isMinimalMode ? "h-6 w-6" : "h-5 w-5"}
                  />
                  {!isMinimalMode && <span>Saved</span>}
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarContent>

        {/* Conditional Footer - only show in full mode */}
        {!isMinimalMode && (
          <SidebarFooter className="p-4">
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  tooltip="Settings"
                  className="py-3 text-sm"
                >
                  <Link
                    to="/settings"
                    className="flex items-center gap-3 font-medium"
                  >
                    <Settings className="h-5 w-5" />
                    <span>Settings</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  tooltip="Logout"
                  className="py-3 text-sm"
                >
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 font-medium"
                  >
                    <LogOut className="h-5 w-5" />
                    <span>Logout</span>
                  </button>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>

            <div className="p-3 mt-3 bg-amber-50 rounded-lg">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10 border-2 border-amber-200">
                  <AvatarImage
                    src={
                      userDetails?.profilePicture ||
                      "/placeholder.svg?height=40&=40"
                    }
                    alt={userDetails?.username}
                  />
                  <AvatarFallback>{userDetails?.username?.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold text-sm">
                    {userDetails?.username}
                  </p>
                  {/* <p className="text-xs text-gray-500">Full Name</p> */}
                </div>
              </div>
            </div>
          </SidebarFooter>
        )}

        {/* Minimal mode footer with just Settings and Logout icons */}
        {isMinimalMode && (
          <SidebarFooter className="p-2 space-y-1">
            <SidebarMenu className="space-y-1">
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  tooltip="Settings"
                  className="h-14 w-14 mx-auto flex items-center justify-center rounded-xl hover:bg-amber-50 transition-colors"
                >
                  <Link
                    to="/settings"
                    className="flex items-center justify-center font-medium"
                  >
                    <Settings className="h-6 w-6" />
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton
                  tooltip="Logout"
                  className="h-14 w-14 mx-auto flex items-center justify-center rounded-xl hover:bg-amber-50 transition-colors"
                  onClick={handleLogout}
                >
                  <div className="flex items-center justify-center font-medium cursor-pointer">
                    <LogOut className="h-6 w-6" />
                  </div>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarFooter>
        )}
      </Sidebar>
    </>
  );
}
