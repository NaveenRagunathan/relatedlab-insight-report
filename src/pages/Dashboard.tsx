import { BurnDownChart } from "@/components/dashboard/BurnDownChart";
import TaskProgressBar from "@/components/dashboard/TaskProgressBar";
import { useTasks } from "@/hooks/useTasks";

export default function Dashboard() {
  const { tasks, isLoading } = useTasks();

  if (isLoading) {
    return <div>Loading dashboard...</div>;
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
      </div>

      <div className="grid gap-4">
        <TaskProgressBar />
        <BurnDownChart tasks={tasks} />
      </div>
    </div>
  );
} 