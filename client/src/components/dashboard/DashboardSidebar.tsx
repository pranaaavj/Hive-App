import { cn } from "@/lib/utils";
import { 
  LayoutDashboard, 
  Users, 
  FileText, 
  BarChart3, 
  Settings,
  ChevronLeft,
  ChevronRight 
} from "lucide-react";

interface SidebarProps {
  activeSection: string;
  setActiveSection: (section: string) => void;
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
}

const menuItems = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "users", label: "Users", icon: Users },
  { id: "posts", label: "Posts", icon: FileText },
  { id: "analytics", label: "Analytics", icon: BarChart3 },
  { id: "settings", label: "Settings", icon: Settings },
];

export const DashboardSidebar = ({ 
  activeSection, 
  setActiveSection, 
  collapsed, 
  setCollapsed 
}: SidebarProps) => {
  return (
    <div className={cn(
      "fixed left-0 top-0 h-full bg-slate-900 text-white transition-all duration-300 z-50",
      collapsed ? "w-16" : "w-64"
    )}>
      <div className="p-4 border-b border-slate-800">
        <div className="flex items-center justify-between">
          {!collapsed && (
            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              SocialAdmin
            </h1>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
          >
            {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
          </button>
        </div>
      </div>
      
      <nav className="mt-6">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeSection === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => setActiveSection(item.id)}
              className={cn(
                "w-full flex items-center px-4 py-3 text-left transition-all duration-200 hover:bg-slate-800",
                isActive && "bg-slate-800 border-r-2 border-blue-400"
              )}
            >
              <Icon size={20} className={cn(
                "transition-colors",
                isActive ? "text-blue-400" : "text-slate-400"
              )} />
              {!collapsed && (
                <span className={cn(
                  "ml-3 transition-colors",
                  isActive ? "text-white" : "text-slate-300"
                )}>
                  {item.label}
                </span>
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
};