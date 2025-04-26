export type TaskStatus = "not-started" | "in-progress" | "completed";
export type TaskPriority = "urgent" | "high" | "normal" | "low";

export interface Task {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  estimated_minutes: number;
  actual_minutes: number | null;
  start_time: string | null;
  end_time: string | null;
  created_at: string;
  color: string | null;
  category: string | null;
  user_id: string;
}
