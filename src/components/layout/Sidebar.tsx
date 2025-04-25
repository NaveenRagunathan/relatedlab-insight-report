
import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  BarChart3,
  CalendarDays,
  CheckCircle,
  ChevronDown,
  HelpCircle,
  Home,
  Inbox,
  Layers,
  MessageSquare,
  PlusCircle,
  Settings,
  Users,
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { TaskForm } from "@/components/tasks/TaskForm";
import { useTasks } from "@/hooks/useTasks";

type SidebarItem = {
  title: string;
  icon: JSX.Element;
  href: string;
  badge?: number;
  children?: {
    title: string;
    href: string;
    badge?: number;
  }[];
};

const Sidebar = () => {
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    Tasks: true, // Open by default
  });
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const { tasks } = useTasks();
  const location = useLocation();

  // Calculate task counts for each status
  const backlogCount = tasks?.filter(task => task.status === "backlog").length || 0;
  const inProgressCount = tasks?.filter(task => task.status === "in-progress").length || 0;
  const validationCount = tasks?.filter(task => task.status === "validation").length || 0;
  const doneCount = tasks?.filter(task => task.status === "done").length || 0;

  const sidebarItems: SidebarItem[] = [
    {
      title: "Overview",
      icon: <Home size={18} />,
      href: "/",
    },
    {
      title: "Calendar",
      icon: <CalendarDays size={18} />,
      href: "/calendar",
    },
    {
      title: "Tasks",
      icon: <CheckCircle size={18} />,
      href: "/tasks",
      badge: tasks?.length || 0,
      children: [
        { title: "Backlog", href: "/tasks/backlog", badge: backlogCount },
        { title: "In progress", href: "/tasks/in-progress", badge: inProgressCount },
        { title: "Validation", href: "/tasks/validation", badge: validationCount },
        { title: "Done", href: "/tasks/done", badge: doneCount },
      ],
    },
    {
      title: "Tools",
      icon: <Layers size={18} />,
      href: "/tools",
      children: [
        { title: "Notification", href: "/tools/notification", badge: 2 },
        { title: "Inbox", href: "/tools/inbox" },
        { title: "Integration", href: "/tools/integration" },
        { title: "Reporting", href: "/tools/reporting" },
      ],
    },
    {
      title: "Metrics",
      icon: <BarChart3 size={18} />,
      href: "/metrics",
      children: [
        { title: "Active", href: "/metrics/active", badge: 16 },
        { title: "Past", href: "/metrics/past" },
      ],
    },
  ];

  const bottomItems: SidebarItem[] = [
    {
      title: "Help Center",
      icon: <HelpCircle size={18} />,
      href: "/help",
    },
    {
      title: "Settings",
      icon: <Settings size={18} />,
      href: "/settings",
    },
    {
      title: "Invite teams",
      icon: <Users size={18} />,
      href: "/invite",
    },
  ];

  const toggleSection = (title: string) => {
    setOpenSections(prev => ({
      ...prev,
      [title]: !prev[title],
    }));
  };

  const renderSidebarItems = (items: SidebarItem[]) => {
    return items.map((item) => (
      <div key={item.title} className="mb-1">
        {item.children ? (
          <div>
            <button
              onClick={() => toggleSection(item.title)}
              className={cn(
                "flex items-center w-full p-2 rounded-md text-sm font-medium hover:bg-sidebar-accent group",
                location.pathname === item.href && "bg-sidebar-accent"
              )}
            >
              <span className="mr-2 text-sidebar-foreground/70 group-hover:text-sidebar-foreground">
                {item.icon}
              </span>
              <span className="flex-1 text-left">{item.title}</span>
              {item.badge !== undefined && (
                <span className="ml-auto bg-primary/10 text-primary text-xs font-semibold px-2 py-0.5 rounded">
                  {item.badge}
                </span>
              )}
              <ChevronDown
                size={16}
                className={cn(
                  "ml-2 text-sidebar-foreground/50",
                  openSections[item.title] && "transform rotate-180"
                )}
              />
            </button>

            {openSections[item.title] && (
              <div className="ml-6 mt-1 space-y-1">
                {item.children.map((child) => (
                  <Link
                    key={child.title}
                    to={child.href}
                    className={cn(
                      "flex items-center p-2 rounded-md text-sm hover:bg-sidebar-accent",
                      location.pathname === child.href && "bg-sidebar-accent"
                    )}
                  >
                    <span className="flex-1">{child.title}</span>
                    {child.badge !== undefined && (
                      <span className="ml-auto bg-primary/10 text-primary text-xs font-semibold px-2 py-0.5 rounded">
                        {child.badge}
                      </span>
                    )}
                  </Link>
                ))}
              </div>
            )}
          </div>
        ) : (
          <Link
            to={item.href}
            className={cn(
              "flex items-center w-full p-2 rounded-md text-sm font-medium hover:bg-sidebar-accent group",
              location.pathname === item.href && "bg-sidebar-accent"
            )}
          >
            <span className="mr-2 text-sidebar-foreground/70 group-hover:text-sidebar-foreground">
              {item.icon}
            </span>
            <span>{item.title}</span>
            {item.badge !== undefined && (
              <span className="ml-auto bg-primary/10 text-primary text-xs font-semibold px-2 py-0.5 rounded">
                {item.badge}
              </span>
            )}
          </Link>
        )}
      </div>
    ));
  };

  return (
    <div className="w-64 bg-sidebar h-screen flex flex-col py-5 border-r">
      <div className="px-5 mb-6 flex items-center">
        <div className="h-8 w-8 bg-primary rounded-md flex items-center justify-center">
          <Inbox className="h-5 w-5 text-white" />
        </div>
        <h1 className="ml-2 font-semibold text-lg">RelatedLab</h1>
      </div>
      
      <div className="px-3 mb-2">
        <button 
          className="w-full flex items-center justify-center gap-2 bg-primary text-white p-2 rounded-md text-sm font-medium"
          onClick={() => setIsCreateDialogOpen(true)}
        >
          <PlusCircle size={16} />
          <span>Create task</span>
        </button>
      </div>
      
      <div className="px-3 py-2 flex-1 overflow-y-auto">
        {renderSidebarItems(sidebarItems)}
      </div>
      
      <div className="mt-auto px-3 pt-3 border-t">
        {renderSidebarItems(bottomItems)}
      </div>
      
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Task</DialogTitle>
          </DialogHeader>
          <TaskForm onSuccess={() => setIsCreateDialogOpen(false)} />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Sidebar;
