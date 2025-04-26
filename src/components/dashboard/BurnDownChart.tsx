import { Task } from "@/types/task";
import {
    CategoryScale,
    ChartData,
    Chart as ChartJS,
    Legend,
    LinearScale,
    LineElement,
    PointElement,
    Title,
    Tooltip,
} from "chart.js";
import { useMemo } from "react";
import { Line } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface BurnDownChartProps {
  tasks: Task[];
}

export function BurnDownChart({ tasks }: BurnDownChartProps) {
  const chartData = useMemo(() => {
    // Group tasks by week
    const tasksByWeek = tasks.reduce((acc, task) => {
      if (!task.created_at) return acc;

      const date = new Date(task.created_at);
      const weekStart = new Date(date);
      weekStart.setDate(date.getDate() - date.getDay());
      const weekKey = weekStart.toISOString().split('T')[0];

      if (!acc[weekKey]) {
        acc[weekKey] = {
          totalHours: 0,
          completedHours: 0,
        };
      }

      // Convert minutes to hours
      const estimatedHours = (task.estimated_minutes || 0) / 60;
      const actualHours = (task.actual_minutes || 0) / 60;

      acc[weekKey].totalHours += estimatedHours;
      if (task.status === 'completed') {
        acc[weekKey].completedHours += actualHours || estimatedHours;
      }

      return acc;
    }, {} as Record<string, { totalHours: number; completedHours: number }>);

    // Sort weeks and calculate cumulative values
    const sortedWeeks = Object.keys(tasksByWeek).sort();
    let remainingWork = 0;
    const idealBurndown: number[] = [];
    const actualBurndown: number[] = [];

    sortedWeeks.forEach((week, index) => {
      remainingWork += tasksByWeek[week].totalHours;
      const completedWork = tasksByWeek[week].completedHours;
      
      // Calculate ideal burndown
      const totalWeeks = sortedWeeks.length;
      const idealWorkPerWeek = remainingWork / (totalWeeks - index);
      idealBurndown.push(remainingWork - (idealWorkPerWeek * index));
      
      // Calculate actual burndown
      actualBurndown.push(remainingWork - completedWork);
    });

    const data: ChartData<"line"> = {
      labels: sortedWeeks.map(week => {
        const date = new Date(week);
        return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(date);
      }),
      datasets: [
        {
          label: "Ideal Burndown",
          data: idealBurndown,
          borderColor: "rgb(75, 192, 192)",
          backgroundColor: "rgba(75, 192, 192, 0.5)",
          borderDash: [5, 5],
        },
        {
          label: "Actual Burndown",
          data: actualBurndown,
          borderColor: "rgb(255, 99, 132)",
          backgroundColor: "rgba(255, 99, 132, 0.5)",
        },
      ],
    };

    return data;
  }, [tasks]);

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: "top" as const,
      },
      title: {
        display: true,
        text: "Project Burndown Chart (Hours)",
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: "Remaining Work (Hours)",
        },
      },
    },
  };

  return (
    <div className="p-4 border rounded-lg bg-card">
      <Line data={chartData} options={options} />
    </div>
  );
} 