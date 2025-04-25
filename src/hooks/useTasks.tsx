
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Task, TaskStatus } from "@/types/task";
import { useToast } from "@/hooks/use-toast";

export function useTasks(status?: TaskStatus | "all") {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Modified query to support optional status filtering
  const {
    data: tasks = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["tasks", status],
    queryFn: async () => {
      let query = supabase
        .from("tasks")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (status && status !== "all") {
        query = query.eq("status", status);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as Task[];
    },
  });

  const createTask = useMutation({
    mutationFn: async (newTask: Omit<Task, "id" | "created_at">) => {
      // Generate a UUID for user_id if not provided
      const user_id = newTask.user_id || "00000000-0000-0000-0000-000000000000";
      
      const { data, error } = await supabase
        .from("tasks")
        .insert([{ ...newTask, user_id }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      toast({
        title: "Success",
        description: "Task created successfully",
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to create task",
      });
      console.error("Error creating task:", error);
    },
  });

  const updateTask = useMutation({
    mutationFn: async ({ id, ...task }: Partial<Task> & { id: string }) => {
      const { data, error } = await supabase
        .from("tasks")
        .update(task)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      toast({
        title: "Success",
        description: "Task updated successfully",
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update task",
      });
      console.error("Error updating task:", error);
    },
  });

  const deleteTask = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("tasks").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      toast({
        title: "Success",
        description: "Task deleted successfully",
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete task",
      });
      console.error("Error deleting task:", error);
    },
  });

  // Add export functionality
  const exportTasks = async (format: "csv" | "json") => {
    try {
      const { data, error } = await supabase
        .from("tasks")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      
      if (format === "json") {
        // Export as JSON
        const jsonString = JSON.stringify(data, null, 2);
        const blob = new Blob([jsonString], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `tasks-export-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        toast({
          title: "Success",
          description: "Tasks exported as JSON successfully",
        });
      } else if (format === "csv") {
        // Export as CSV
        const headers = ["id", "title", "description", "status", "priority", "estimated_minutes", "actual_minutes", "created_at"];
        const csvContent = [
          headers.join(","),
          ...data.map(task => 
            headers.map(header => {
              const value = task[header as keyof Task];
              // Handle strings with commas by quoting them
              if (typeof value === 'string' && value.includes(',')) {
                return `"${value}"`;
              }
              return value || '';
            }).join(",")
          )
        ].join("\n");
        
        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `tasks-export-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        toast({
          title: "Success",
          description: "Tasks exported as CSV successfully",
        });
      }
    } catch (error) {
      console.error("Error exporting tasks:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to export tasks",
      });
    }
  };

  return {
    tasks,
    isLoading,
    error,
    createTask,
    updateTask,
    deleteTask,
    exportTasks,
  };
}
