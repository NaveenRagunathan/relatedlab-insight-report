import { Task } from "@/types/task";
// Potential libraries: react-calendar-timeline, vis-timeline-react

interface TasksTimelineProps {
  tasks: Task[];
}

const TasksTimeline = ({ tasks }: TasksTimelineProps) => {
  // TODO: Implement Timeline view using a suitable library
  // Needs tasks with start and end dates (e.g., start_time, end_time)
  // Map tasks to timeline items/groups

  return (
    <div className="p-4 border rounded-md bg-gray-50">
      <h2 className="text-xl font-semibold mb-4">Timeline View</h2>
      <p className="text-muted-foreground">
        Timeline view is not yet implemented. Requires a timeline library and date mapping.
        Received {tasks.length} tasks.
      </p>
      {/* Placeholder for where the timeline would render */}
      <div className="mt-4 h-96 bg-white border rounded flex items-center justify-center text-muted-foreground">
        [Timeline Component Placeholder]
      </div>
    </div>
  );
};

export default TasksTimeline; 