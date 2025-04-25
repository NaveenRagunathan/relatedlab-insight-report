
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTasks } from "@/hooks/useTasks";

interface TaskStatus {
  name: string;
  count: number;
  color: string;
}

const TaskProgressBar = () => {
  const { tasks } = useTasks();
  
  // Calculate task counts for each status
  const backlogCount = tasks.filter(task => task.status === "backlog").length;
  const inProgressCount = tasks.filter(task => task.status === "in-progress").length;
  const validationCount = tasks.filter(task => task.status === "validation").length;
  const doneCount = tasks.filter(task => task.status === "done").length;
  
  const statuses: TaskStatus[] = [
    { name: "Backlog", count: backlogCount, color: "bg-status-backlog" },
    { name: "In Progress", count: inProgressCount, color: "bg-status-progress" },
    { name: "Validation", count: validationCount, color: "bg-status-validation" },
    { name: "Done", count: doneCount, color: "bg-status-done" },
  ];
  
  const total = statuses.reduce((acc, status) => acc + status.count, 0);
  
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-medium">Task Distribution</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex h-2 w-full overflow-hidden rounded-full bg-muted mb-5">
          {statuses.map((status) => {
            const width = total > 0 ? (status.count / total) * 100 : 0;
            return (
              <div
                key={status.name}
                className={`${status.color}`}
                style={{ width: `${width}%` }}
              />
            );
          })}
        </div>
        
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {statuses.map((status) => (
            <div key={status.name} className="flex flex-col">
              <div className="flex items-center gap-2">
                <div className={`h-3 w-3 rounded-full ${status.color}`} />
                <span className="text-sm font-medium">{status.name}</span>
              </div>
              <div className="mt-1 text-xl font-semibold">{status.count}</div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default TaskProgressBar;
