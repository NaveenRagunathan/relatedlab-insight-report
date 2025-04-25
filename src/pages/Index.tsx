
import { 
  Layers, 
  MessageSquare, 
  Calendar, 
  Users,
  Plus,
  Download
} from "lucide-react";
import { useState } from "react";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import TaskStatCard from "@/components/dashboard/TaskStatCard";
import TaskProgressBar from "@/components/dashboard/TaskProgressBar";
import ProgressChart from "@/components/dashboard/ProgressChart";
import TasksList from "@/components/tasks/TasksList";
import MetricCard from "@/components/dashboard/MetricCard";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { TaskForm } from "@/components/tasks/TaskForm";
import { useTasks } from "@/hooks/useTasks";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Index = () => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const { tasks, exportTasks } = useTasks();

  const taskStats = {
    backlog: tasks.filter(t => t.status === "backlog").length,
    inProgress: tasks.filter(t => t.status === "in-progress").length,
    validation: tasks.filter(t => t.status === "validation").length,
    done: tasks.filter(t => t.status === "done").length,
  };

  const handleExport = (format: "csv" | "json") => {
    exportTasks(format);
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold">Tasks Dashboard</h1>
            <div className="flex gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">
                    <Download className="mr-2 h-4 w-4" />
                    Export Tasks
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

              <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Create Task
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create New Task</DialogTitle>
                  </DialogHeader>
                  <TaskForm onSuccess={() => setIsCreateDialogOpen(false)} />
                </DialogContent>
              </Dialog>
            </div>
          </div>

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
                value={tasks.length} 
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
            <ProgressChart />
          </div>
          
          <div className="grid grid-cols-1 gap-6">
            <TasksList />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
