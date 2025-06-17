import { useState } from "react";
import { Outlet, useLocation, matchPath } from "react-router-dom";
import { AppSidebar } from "../AppSidebar";
import { RightSidebar } from "../RightSidebar";
import { PostModal } from "../modals/PostModal";
import { SidebarProvider } from "../ui/sidebar";

export const MainLayout: React.FC = () => {
  const [isCreatePostModalOpen, setIsCreatePostModalOpen] = useState(false);
  const location = useLocation();

  
  const pathsWithoutRightSidebar = ['/profile/:userId', 'profile/edit/:userId', '/messages', '/settings'];


  const minimalSidebarPages = ['/create', '/messages', '/settings'];
  const isMinimalPage = minimalSidebarPages.includes(location.pathname)


  const isPathWithoutRightSidebar = pathsWithoutRightSidebar.some(path =>
    matchPath({ path, end: true }, location.pathname)
  );

  const isMinimalSidebarPath = minimalSidebarPages.some(path => {

    if (path === location.pathname) return true;
    
    return matchPath({ path, end: false }, location.pathname);
  });

  const showRightSidebar = !isPathWithoutRightSidebar;
  
  const sidebarWidth = isMinimalSidebarPath ? 80 : 256; 
  const sidebarWidthClass = isMinimalSidebarPath ? "w-20" : "w-64";

  return (
    <SidebarProvider>
      <main className="relative h-screen w-full overflow-hidden">
        {/* Left Sidebar */}
        <div className={`hidden xl:flex ${sidebarWidthClass} bg-white border-r border-light-4 fixed left-0 top-0 h-full z-10`}>
          <AppSidebar 
            onCreateClick={() => setIsCreatePostModalOpen(true)} 
            minimalMode={isMinimalSidebarPath} 
          />
        </div>
        
        {/* Main Content */}
        <div 
          className={`flex-1 h-full overflow-y-auto ${isMinimalPage ? "" : "px-4 md:px-8 xl:px-12 py-6"}  bg-amber-50  transition-all duration-300 ease-in-out ${
            showRightSidebar ? "xl:mr-[300px]" : ""
          }`}
          style={{
            marginLeft: window.innerWidth >= 1280 ? `${sidebarWidth}px` : '0'
          }}
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