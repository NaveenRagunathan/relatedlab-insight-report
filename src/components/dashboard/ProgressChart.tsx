import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Task } from "@/types/task";
import { eachWeekOfInterval, endOfWeek, format, isWithinInterval, startOfWeek } from 'date-fns';
import { useMemo } from "react";
import {
    Bar,
    BarChart,
    CartesianGrid,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis
} from "recharts";

interface ProgressChartProps {
  tasks: Task[] | undefined;
}

const ProgressChart = ({ tasks = [] }: ProgressChartProps) => {

  const weeklyHoursData = useMemo(() => {
    if (!tasks || tasks.length === 0) return [];

    const relevantTasks = tasks.filter(t => t.actual_minutes && t.actual_minutes > 0 && t.created_at);
    if (relevantTasks.length === 0) return [];

    relevantTasks.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
    const firstDate = new Date(relevantTasks[0].created_at);
    const lastDate = new Date(relevantTasks[relevantTasks.length - 1].created_at);

    const weeks = eachWeekOfInterval({
      start: startOfWeek(firstDate, { weekStartsOn: 1 }),
      end: endOfWeek(lastDate, { weekStartsOn: 1 })
    }, { weekStartsOn: 1 });

    const weeklyData = weeks.map(weekStart => {
      const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 });
      const weekLabel = `Week of ${format(weekStart, 'MMM d')}`;
      
      let totalMinutes = 0;
      relevantTasks.forEach(task => {
        const taskDate = new Date(task.created_at);
        if (isWithinInterval(taskDate, { start: weekStart, end: weekEnd })) {
          totalMinutes += task.actual_minutes || 0;
        }
      });

      return {
        name: weekLabel,
        hours: parseFloat((totalMinutes / 60).toFixed(2))
      };
    });

    return weeklyData.slice(-12);

  }, [tasks]);

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-medium">Weekly Hours Logged</CardTitle>
      </CardHeader>
      <CardContent className="pt-0 h-[300px]">
        {weeklyHoursData.length === 0 ? (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            No weekly hours data available.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={weeklyHoursData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-muted" />
              <XAxis 
                dataKey="name" 
                tickLine={false} 
                axisLine={false}
                tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                interval={0}
              />
              <YAxis 
                tickLine={false} 
                axisLine={false}
                tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                label={{ value: 'Hours', angle: -90, position: 'insideLeft', fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--card))', 
                  borderColor: 'hsl(var(--border))',
                  borderRadius: '0.5rem',
                  boxShadow: 'var(--tw-shadow)',
                }}
                cursor={{ fill: 'hsl(var(--muted))' }}
                formatter={(value) => [`${value} hrs`, 'Logged']}
              />
              <Bar 
                dataKey="hours" 
                fill="hsl(var(--primary))" 
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
};

export default ProgressChart;
