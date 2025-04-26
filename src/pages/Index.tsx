import MetricCard from "@/components/dashboard/MetricCard";
import ProgressChart from "@/components/dashboard/ProgressChart";
import TaskProgressBar from "@/components/dashboard/TaskProgressBar";
import TaskStatCard from "@/components/dashboard/TaskStatCard";
import Header from "@/components/layout/Header";
import Sidebar from "@/components/layout/Sidebar";
import { ShareDialog } from "@/components/tasks/ShareDialog";
import { TaskFilter, TaskFilters } from "@/components/tasks/TaskFilter";
import TasksBoard from "@/components/tasks/TasksBoard";
import TasksCalendar from "@/components/tasks/TasksCalendar";
import TasksList from "@/components/tasks/TasksList";
import TasksTimeline from "@/components/tasks/TasksTimeline";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useTasks } from "@/hooks/useTasks";
import { Task } from "@/types/task";
import {
    CalendarDays,
    Download,
    Filter,
    GanttChart,
    Kanban,
    Layers,
    LayoutGrid,
    MessageSquare,
    Share
} from "lucide-react";
import { useMemo, useState } from "react";

const Index = () => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeView, setActiveView] = useState("spreadsheet");
  const [isFilterDialogOpen, setIsFilterDialogOpen] = useState(false);
  const [filters, setFilters] = useState<TaskFilters>({});
  const [shareTask, setShareTask] = useState<Task | null>(null);
  const { toast } = useToast();
  
  const { tasks, isLoading, error, exportTasks } = useTasks('all');

  const filteredTasks = useMemo(() => {
    if (!tasks) return [];
    
    return tasks.filter(task => {
      // Apply search filter
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        if (!task.title.toLowerCase().includes(searchLower) &&
            !(task.description && task.description.toLowerCase().includes(searchLower))) {
          return false;
        }
      }

      // Apply status filter
      if (filters.status && task.status !== filters.status) {
        return false;
      }

      // Apply priority filter
      if (filters.priority && task.priority !== filters.priority) {
        return false;
      }

      // Apply category filter
      if (filters.category && task.category !== filters.category) {
        return false;
      }

      return true;
    });
  }, [tasks, searchTerm, filters]);

  const taskStats = useMemo(() => {
    if (!tasks) return { backlog: 0, inProgress: 0, validation: 0, done: 0 };
    return {
    backlog: tasks.filter(t => t.status === "backlog").length,
    inProgress: tasks.filter(t => t.status === "in-progress").length,
    validation: tasks.filter(t => t.status === "validation").length,
    done: tasks.filter(t => t.status === "done").length,
  };
  }, [tasks]);

  const handleExport = (format: "csv" | "json") => {
    exportTasks(format);
  };

  const handleShareClick = () => {
    console.log("Share button clicked");
    toast({ title: "Share Clicked", description: "Share functionality not implemented yet." });
  };

  const handleFilterClick = () => {
    console.log("Filter button clicked");
    toast({ title: "Filter Clicked", description: "Filter functionality not implemented yet." });
  };

  if (isLoading) return <div>Loading tasks...</div>;
  if (error) return <div>Error loading tasks: {error.message}</div>;

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header 
          onSearchChange={setSearchTerm} 
          activeView={activeView}
          onViewChange={setActiveView}
          onShareClick={handleShareClick}
          onFilterClick={handleFilterClick}
        />
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <TaskStatCard 
              title="Backlog" 
              count={taskStats.backlog} 
              type="backlog" 
            />
            <TaskStatCard 
              title="In Progress" 
              count={taskStats.inProgress} 
              type="progress" 
            />
            <TaskStatCard 
              title="Validation" 
              count={taskStats.validation} 
              type="validation" 
            />
            <TaskStatCard 
              title="Completed" 
              count={taskStats.done} 
              type="done" 
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <TaskProgressBar />
            </div>
            <div>
              <MetricCard 
                title="Total Tasks" 
                value={tasks?.length || 0} 
                icon={<Layers size={18} />} 
              />
              <div className="h-4" />
              <MetricCard 
                title="Comments" 
                value={0} 
                icon={<MessageSquare size={18} />} 
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 gap-6">
            <ProgressChart tasks={tasks} />
          </div>
          
          <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
              <h2 className="text-3xl font-bold tracking-tight">Tasks</h2>
              <div className="flex items-center space-x-2">
                <div className="relative w-64">
                  <Input
                    type="search"
                    placeholder="Search tasks..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full"
                  />
                </div>
                <div className="flex items-center space-x-1 bg-muted p-1 rounded-md">
                  <Button
                    variant={activeView === 'spreadsheet' ? 'secondary' : 'ghost'}
                    size="sm"
                    onClick={() => setActiveView('spreadsheet')}
                  >
                    <LayoutGrid className="h-4 w-4 mr-1" />
                    List
                  </Button>
                  <Button
                    variant={activeView === 'board' ? 'secondary' : 'ghost'}
                    size="sm"
                    onClick={() => setActiveView('board')}
                  >
                    <Kanban className="h-4 w-4 mr-1" />
                    Board
                  </Button>
                  <Button
                    variant={activeView === 'calendar' ? 'secondary' : 'ghost'}
                    size="sm"
                    onClick={() => setActiveView('calendar')}
                  >
                    <CalendarDays className="h-4 w-4 mr-1" />
                    Calendar
                  </Button>
                  <Button
                    variant={activeView === 'timeline' ? 'secondary' : 'ghost'}
                    size="sm"
                    onClick={() => setActiveView('timeline')}
                  >
                    <GanttChart className="h-4 w-4 mr-1" />
                    Timeline
                  </Button>
                </div>
                <Button onClick={() => setIsFilterDialogOpen(true)}>
                  <Filter className="mr-2 h-4 w-4" />
                  Filter
                </Button>
                <Button onClick={handleShareClick}>
                  <Share className="mr-2 h-4 w-4" />
                  Share
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button>
                      <Download className="mr-2 h-4 w-4" />
                      Export
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => handleExport("csv")}>
                      Export as CSV
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleExport("json")}>
                      Export as JSON
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            <div className="grid gap-4">
              {activeView === 'spreadsheet' && <TasksList tasks={filteredTasks} onShare={(task) => setShareTask(task)} />}
              {activeView === 'board' && <TasksBoard tasks={filteredTasks} />}
              {activeView === 'calendar' && <TasksCalendar tasks={filteredTasks} />}
              {activeView === 'timeline' && <TasksTimeline tasks={filteredTasks} />}
            </div>
          </div>
        </div>
      </div>

      <TaskFilter
        open={isFilterDialogOpen}
        onOpenChange={setIsFilterDialogOpen}
        onFilter={setFilters}
      />

      {shareTask && (
        <ShareDialog
          task={shareTask}
          open={!!shareTask}
          onOpenChange={(open) => !open && setShareTask(null)}
        />
      )}
    </div>
  );
};

export default Index;
