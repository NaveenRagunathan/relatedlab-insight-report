
import { useMemo, useState } from "react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  MoreHorizontal, 
  MessageSquare, 
  Calendar, 
  ChevronDown,
  Edit,
  Trash2,
  FileDown
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useTasks } from "@/hooks/useTasks";
import { Task, TaskStatus } from "@/types/task";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { TaskForm } from "./TaskForm";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const priorityStyles = {
  urgent: "bg-priority-urgent/10 text-priority-urgent",
  high: "bg-priority-high/10 text-priority-high",
  normal: "bg-priority-normal/10 text-priority-normal",
  low: "bg-priority-low/10 text-priority-low",
};

const statusStyles = {
  backlog: "bg-status-backlog/10 text-status-backlog border-status-backlog",
  "in-progress": "bg-status-progress/10 text-status-progress border-status-progress",
  validation: "bg-status-validation/10 text-status-validation border-status-validation",
  done: "bg-status-done/10 text-status-done border-status-done",
};

const TasksList = () => {
  const [statusFilter, setStatusFilter] = useState<TaskStatus | "all">("all");
  const [editTask, setEditTask] = useState<Task | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const { tasks, isLoading, error, deleteTask, exportTasks } = useTasks(statusFilter);
  
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "No due date";
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
    }).format(date);
  };
  
  const isOverdue = (dateString: string | null) => {
    if (!dateString) return false;
    const today = new Date();
    const dueDate = new Date(dateString);
    return dueDate < today;
  };

  const handleEditTask = (task: Task) => {
    setEditTask(task);
    setIsEditDialogOpen(true);
  };

  const handleDeleteTask = (taskId: string) => {
    if (window.confirm("Are you sure you want to delete this task?")) {
      deleteTask.mutate(taskId);
    }
  };

  const handleExport = (format: "csv" | "json") => {
    exportTasks(format);
  };

  if (isLoading) {
    return <div className="text-center p-4">Loading tasks...</div>;
  }

  if (error) {
    return <div className="text-center text-destructive p-4">Error loading tasks</div>;
  }
  
  return (
    <div className="rounded-md border">
      <div className="p-4 border-b flex justify-between items-center">
        <div className="font-semibold">Tasks</div>
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <FileDown className="mr-2 h-4 w-4" />
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
          <Button
            variant="outline" 
            size="sm" 
            onClick={() => setStatusFilter("all")}
            className={cn(
              "text-sm",
              statusFilter === "all" && "bg-secondary"
            )}
          >
            All
          </Button>
          <Button
            variant="outline" 
            size="sm" 
            onClick={() => setStatusFilter("backlog")}
            className={cn(
              "text-sm",
              statusFilter === "backlog" && "bg-secondary"
            )}
          >
            Backlog
          </Button>
          <Button
            variant="outline" 
            size="sm" 
            onClick={() => setStatusFilter("in-progress")}
            className={cn(
              "text-sm",
              statusFilter === "in-progress" && "bg-secondary"
            )}
          >
            In Progress
          </Button>
          <Button
            variant="outline" 
            size="sm" 
            onClick={() => setStatusFilter("validation")}
            className={cn(
              "text-sm",
              statusFilter === "validation" && "bg-secondary"
            )}
          >
            Validation
          </Button>
          <Button
            variant="outline" 
            size="sm" 
            onClick={() => setStatusFilter("done")}
            className={cn(
              "text-sm",
              statusFilter === "done" && "bg-secondary"
            )}
          >
            Done
          </Button>
        </div>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">ID</TableHead>
            <TableHead>Task</TableHead>
            <TableHead className="w-[100px]">Status</TableHead>
            <TableHead className="w-[100px]">Priority</TableHead>
            <TableHead className="w-[120px]">Due Date</TableHead>
            <TableHead className="w-[120px]">Category</TableHead>
            <TableHead className="w-[80px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tasks.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                No tasks found. Create a new task to get started.
              </TableCell>
            </TableRow>
          ) : (
            tasks.map((task) => (
              <TableRow key={task.id}>
                <TableCell className="font-mono text-sm">{task.id.slice(0, 8)}</TableCell>
                <TableCell className="font-medium">{task.title}</TableCell>
                <TableCell>
                  <Badge 
                    variant="outline" 
                    className={cn("font-normal border-l-4 pl-2", statusStyles[task.status as keyof typeof statusStyles])}
                  >
                    {task.status.replace("-", " ")}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge 
                    variant="outline" 
                    className={cn("font-normal", priorityStyles[task.priority])}
                  >
                    {task.priority}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Calendar size={14} className="text-muted-foreground" />
                    <span 
                      className={cn(
                        isOverdue(task.end_time) && task.status !== "done" && "text-destructive"
                      )}
                    >
                      {task.end_time ? formatDate(task.end_time) : "No due date"}
                    </span>
                  </div>
                </TableCell>
                <TableCell>{task.category || "Uncategorized"}</TableCell>
                <TableCell>
                  <div className="flex items-center">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8"
                      onClick={() => handleEditTask(task)}
                    >
                      <Edit size={16} />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8"
                      onClick={() => handleDeleteTask(task.id)}
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
      
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Task</DialogTitle>
          </DialogHeader>
          {editTask && (
            <TaskForm 
              task={editTask} 
              onSuccess={() => setIsEditDialogOpen(false)} 
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TasksList;
