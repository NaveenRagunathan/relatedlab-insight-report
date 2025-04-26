import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Task, TaskStatus } from "@/types/task";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export function useTasks(status?: TaskStatus | "all") {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Fetch tasks, optionally filtering by status
  // TODO: Consider adding date range filtering capabilities for calendar views if needed.
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
    mutationFn: async (newTask: Omit<Task, "id" | "created_at" | "user_id">) => {
      // Use a default user ID since authentication is temporarily removed
      const taskWithDefaultUser = {
        ...newTask,
        user_id: "default-user-id"
      };

      const { data, error } = await supabase
        .from("tasks")
        .insert([taskWithDefaultUser])
        .select()
        .single();

      if (error) {
        console.error("Supabase insert error:", error);
        // Provide more specific error messages based on error code
        if (error.code === "23505") {
          throw new Error("A task with this title already exists");
        } else if (error.code === "23503") {
          throw new Error("Invalid category or status value");
        } else {
          throw error;
        }
      }
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      toast({
        title: "Success",
        description: "Task created successfully",
      });
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : "Failed to create task";
      toast({
        variant: "destructive",
        title: "Error Creating Task",
        description: message,
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
    onSuccess: (data) => {
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

  const migrateTaskStatuses = useMutation({
    mutationFn: async () => {
      const statusMapping: Record<string, TaskStatus> = {
        "backlog": "not-started",
        "in-progress": "in-progress",
        "validation": "in-progress",
        "done": "completed"
      };

      const { data: tasks, error: fetchError } = await supabase
        .from("tasks")
        .select("id, status");

      if (fetchError) throw fetchError;

      const updates = tasks.map(task => ({
        id: task.id,
        status: statusMapping[task.status as string] || "not-started"
      }));

      for (const update of updates) {
        const { error } = await supabase
          .from("tasks")
          .update({ status: update.status })
          .eq("id", update.id);

        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      toast({
        title: "Success",
        description: "Task statuses migrated successfully",
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to migrate task statuses",
      });
      console.error("Error migrating task statuses:", error);
    },
  });

  // Add export functionality
  const exportTasks = async (format: "csv" | "json") => {
    // Note: This fetches all tasks client-side. For very large datasets,
    // consider implementing a server-side export (e.g., Supabase Edge Function)
    // for better performance and scalability.
    try {
      const { data, error } = await supabase
        .from("tasks")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      if (!data) {
          toast({ title: "Info", description: "No tasks to export." });
          return;
      }

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
        // Ensure headers match the actual selected columns if the select changes
        const headers = ["id", "title", "description", "status", "priority", "estimated_minutes", "actual_minutes", "created_at", "user_id", "end_time", "category", "color", "start_time"]; // Adjusted headers
        
        // Function to safely format CSV fields, handling null/undefined, commas, and quotes
        const formatCsvField = (fieldValue: any): string => {
          if (fieldValue === null || typeof fieldValue === 'undefined') {
            return '';
          }
          const stringValue = String(fieldValue);
          // Escape double quotes by doubling them
          const escapedValue = stringValue.replace(/"/g, '""');
          // Enclose in double quotes if it contains comma, newline, or double quote
          if (stringValue.includes(',') || stringValue.includes('\n') || stringValue.includes('"')) {
            return `"${escapedValue}"`;
          }
          return escapedValue; // Return as is if no special characters
        };

        const csvContent = [
          headers.join(","), // Header row
          ...data.map(task =>
            headers.map(header => {
              // Use Task type properties; adjust if Task type differs
              const value = task[header as keyof Task];
              return formatCsvField(value);
            }).join(",") // Join fields for one row
          )
        ].join("\n"); // Join all rows

        const blob = new Blob([`\uFEFF${csvContent}`], { type: "text/csv;charset=utf-8;" }); // Add BOM for Excel compatibility
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
    migrateTaskStatuses,
  };
}
