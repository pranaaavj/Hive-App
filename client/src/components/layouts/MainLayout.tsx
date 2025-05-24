import { useState } from "react";
import { Outlet, useLocation, matchPath } from "react-router-dom";
import { AppSidebar } from "../AppSidebar";
import { RightSidebar } from "../RightSidebar";
import { PostModal } from "../modals/PostModal";
import { SidebarProvider } from "../ui/sidebar";

export const MainLayout: React.FC = () => {
  const [isCreatePostModalOpen, setIsCreatePostModalOpen] = useState(false);
  const location = useLocation();

  const pathsWithoutRightSidebar = ['/profile/:userId','profile/edit/:userId', '/messages', '/settings'];

const isPathWithoutSidebar = pathsWithoutRightSidebar.some(path =>
  matchPath({ path, end: true }, location.pathname)
);

const showRightSidebar = !isPathWithoutSidebar;
  return (
    <SidebarProvider>
      <main className="relative h-screen w-full overflow-hidden">
        {/* Left Sidebar */}
        <div className="hidden xl:flex w-[240px] bg-white border-r border-light-4">
          <AppSidebar onCreateClick={() => setIsCreatePostModalOpen(true)} />
        </div>
        
        {/* Main Content */}
        <div 
          className={`flex-1 h-full overflow-y-auto px-4 md:px-8 bg-amber-50 xl:px-12 py-6 xl:ml-[240px] ${
            showRightSidebar ? "xl:mr-[300px]" : ""
          }`}
        >
          <Outlet />
        </div>
        
        {/* Right Sidebar - Conditionally rendered based on current path */}
        {showRightSidebar && (
          <div className="hidden xl:flex fixed top-0 right-0 w-[300px] h-full bg-white border-l border-light-4 z-20">
            <RightSidebar />
          </div>
        )}
        
        {/* Post Modal */}
        <PostModal open={isCreatePostModalOpen} onOpenChange={setIsCreatePostModalOpen} />
      </main>
    </SidebarProvider>
  );
};