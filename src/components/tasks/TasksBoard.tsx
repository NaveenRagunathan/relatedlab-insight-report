import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useTasks } from "@/hooks/useTasks";
import { cn } from "@/lib/utils";
import { Task, TaskStatus } from "@/types/task";
import { DragDropContext, Draggable, Droppable } from "@hello-pangea/dnd";
import { Calendar } from "lucide-react";

interface TasksBoardProps {
  tasks: Task[];
}

const statusColumns: { id: TaskStatus; title: string }[] = [
  { id: "not-started", title: "Not Started" },
  { id: "in-progress", title: "In Progress" },
  { id: "completed", title: "Completed" },
];

const priorityStyles = {
  urgent: "bg-red-100 text-red-700 border-red-200",
  high: "bg-orange-100 text-orange-700 border-orange-200",
  normal: "bg-blue-100 text-blue-700 border-blue-200",
  low: "bg-gray-100 text-gray-700 border-gray-200",
};

export default function TasksBoard({ tasks }: TasksBoardProps) {
  const { updateTask } = useTasks();

  const handleDragEnd = (result: any) => {
    if (!result.destination) return;

    const taskId = result.draggableId;
    const newStatus = result.destination.droppableId as TaskStatus;
    
    const task = tasks.find(t => t.id === taskId);
    if (task && task.status !== newStatus) {
      updateTask.mutate({ id: taskId, status: newStatus });
    }
  };

  const getTasksByStatus = (status: TaskStatus) => {
    return tasks.filter(task => task.status === status);
  };

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return "-";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "Invalid";
      return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(date);
    } catch (e) { return "Error"; }
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {statusColumns.map(column => (
          <div key={column.id} className="bg-muted/50 rounded-lg p-4">
            <h3 className="font-medium mb-4">{column.title} ({getTasksByStatus(column.id).length})</h3>
            <Droppable droppableId={column.id}>
              {(provided) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className="space-y-2"
                >
                  {getTasksByStatus(column.id).map((task, index) => (
                    <Draggable key={task.id} draggableId={task.id} index={index}>
                      {(provided) => (
                        <Card
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className="bg-white"
                        >
                          <CardContent className="p-4 space-y-2">
                            <div className="font-medium">{task.title}</div>
                            {task.description && (
                              <p className="text-sm text-muted-foreground line-clamp-2">
                                {task.description}
                              </p>
                            )}
                            <div className="flex items-center justify-between">
                              <Badge variant="outline" className={cn("font-normal", priorityStyles[task.priority])}>
                                {task.priority}
                              </Badge>
                              {task.end_time && (
                                <div className="flex items-center text-sm text-muted-foreground">
                                  <Calendar size={12} className="mr-1" />
                                  {formatDate(task.end_time)}
                                </div>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </div>
        ))}
      </div>
    </DragDropContext>
  );
} 