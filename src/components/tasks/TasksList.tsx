import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";
import { useTasks } from "@/hooks/useTasks";
import { cn } from "@/lib/utils";
import { Task, TaskPriority, TaskStatus } from "@/types/task";
import {
    Calendar,
    Edit,
    Share,
    Trash2
} from "lucide-react";
import { useMemo, useState } from "react";
import { TaskForm } from "./TaskForm";

const priorityStyles: Record<TaskPriority, string> = {
  urgent: "bg-red-100 text-red-700 border-red-200",
  high: "bg-orange-100 text-orange-700 border-orange-200",
  normal: "bg-blue-100 text-blue-700 border-blue-200",
  low: "bg-gray-100 text-gray-700 border-gray-200",
};

const statusStyles: Record<TaskStatus, string> = {
  "not-started": "bg-gray-100 text-gray-700 border-gray-300",
  "in-progress": "bg-yellow-100 text-yellow-700 border-yellow-300",
  "completed": "bg-green-100 text-green-700 border-green-300",
};

const ALL_STATUSES: TaskStatus[] = ["not-started", "in-progress", "completed"];

interface TasksListProps {
  tasks: Task[] | undefined;
  onShare?: (task: Task) => void;
}

const TasksList = ({ tasks: initialTasks = [], onShare }: TasksListProps) => {
  const [statusFilter, setStatusFilter] = useState<TaskStatus | "all">("all");
  const [editTask, setEditTask] = useState<Task | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const { deleteTask } = useTasks();
  
  const filteredTasksByStatus = useMemo(() => {
      if (statusFilter === "all") {
          return initialTasks;
      }
      return initialTasks.filter(task => task.status === statusFilter);
  }, [initialTasks, statusFilter]);
  
  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return "-";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "Invalid";
      return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(date);
    } catch (e) { return "Error"; }
  };
  
  const isOverdue = (dateString: string | null | undefined, status: TaskStatus) => {
    if (!dateString || status === 'completed') return false;
    try {
      const today = new Date(); today.setHours(0, 0, 0, 0);
      const dueDate = new Date(dateString); if (isNaN(dueDate.getTime())) return false;
      dueDate.setHours(0, 0, 0, 0);
      return dueDate < today;
    } catch (e) { return false; }
  };

  const handleEditTask = (task: Task) => {
    setEditTask(task);
    setIsEditDialogOpen(true);
  };

  const handleDeleteTask = (taskId: string) => {
    if (window.confirm("Delete task?")) {
      deleteTask.mutate(taskId);
    }
  };

  return (
    <div className="rounded-md border">
      <div className="p-4 border-b flex justify-between items-center flex-wrap gap-y-2">
        <div className="font-semibold text-lg">Tasks ({filteredTasksByStatus.length})</div>
        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant={statusFilter === "all" ? "secondary" : "outline"} 
            size="sm" 
            onClick={() => setStatusFilter("all")}
            className="text-sm"
          >
            All
          </Button>
          {ALL_STATUSES.map(status => (
             <Button
                key={status}
                variant={statusFilter === status ? "secondary" : "outline"}
                size="sm" 
                onClick={() => setStatusFilter(status)}
                className={cn("text-sm capitalize", statusStyles[status])}
            >
                {status.replace("-", " ")}
            </Button>
          ))}
        </div>
      </div>
      
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[80px]">ID</TableHead>
            <TableHead>Task</TableHead>
            <TableHead className="w-[110px]">Status</TableHead>
            <TableHead className="w-[100px]">Priority</TableHead>
            <TableHead className="w-[110px]">Due Date</TableHead>
            <TableHead className="w-[120px]">Category</TableHead>
            <TableHead className="w-[80px] text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredTasksByStatus.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                {initialTasks.length === 0 ? "No tasks found." : "No tasks match filters."}
              </TableCell>
            </TableRow>
          ) : (
            filteredTasksByStatus.map((task) => (
              <TableRow key={task.id}>
                <TableCell className="font-mono text-xs text-muted-foreground">{task.id.slice(0, 6)}</TableCell>
                <TableCell className="font-medium">{task.title || "Untitled Task"}</TableCell>
                <TableCell>
                  <Badge 
                    variant="outline" 
                    className={cn(
                      "font-normal border-l-4 pl-2 capitalize", 
                      statusStyles[task.status]
                    )}
                  >
                    {task.status.replace("-", " ")}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge 
                    variant="outline" 
                    className={cn(
                      "font-normal capitalize", 
                      priorityStyles[task.priority]
                    )}
                  >
                    {task.priority}
                  </Badge>
                </TableCell>
                <TableCell className={cn(isOverdue(task.end_time, task.status) && "text-destructive")}>
                  <div className="flex items-center gap-1">
                    <Calendar size={14} />
                    <span>{formatDate(task.end_time)}</span>
                  </div>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground capitalize">
                  {task.category || "-"}
                </TableCell>
                <TableCell className="text-right">
                  {onShare && (
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8"
                      onClick={() => onShare(task)}
                      aria-label="Share Task"
                    >
                      <Share size={16} />
                    </Button>
                  )}
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8"
                    onClick={() => handleEditTask(task)}
                    aria-label="Edit Task"
                  >
                    <Edit size={16} />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 text-destructive hover:text-destructive/80"
                    onClick={() => handleDeleteTask(task.id)}
                    aria-label="Delete Task"
                  >
                    <Trash2 size={16} />
                  </Button>
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
              onSuccess={() => {
                setIsEditDialogOpen(false);
                setEditTask(null);
              }} 
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TasksList;
