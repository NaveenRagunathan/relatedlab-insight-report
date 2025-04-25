
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";  // Add this import
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Task } from "@/types/task";
import { useTasks } from "@/hooks/useTasks";

interface TaskFormProps {
  task?: Task;
  onSuccess?: () => void;
}

type TaskFormData = Omit<Task, "id" | "created_at">;

export function TaskForm({ task, onSuccess }: TaskFormProps) {
  const { createTask, updateTask } = useTasks();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const defaultEndTime = task?.end_time ? new Date(task.end_time) : undefined;
  const defaultStartTime = task?.start_time ? new Date(task.start_time) : undefined;

  const form = useForm<TaskFormData>({
    defaultValues: task || {
      title: "",
      description: "",
      status: "backlog",
      priority: "normal",
      estimated_minutes: 30,
      actual_minutes: null,
      start_time: null,
      end_time: null,
      color: null,
      category: null,
      user_id: "00000000-0000-0000-0000-000000000000", // Default user ID for anonymous tasks
    },
  });

  const onSubmit = async (data: TaskFormData) => {
    setIsSubmitting(true);
    try {
      // Format dates for submission
      const formattedData = {
        ...data,
        start_time: data.start_time,
        end_time: data.end_time,
      };

      if (task) {
        await updateTask.mutateAsync({ id: task.id, ...formattedData });
      } else {
        await createTask.mutateAsync(formattedData);
        form.reset();
      }
      
      onSuccess?.();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input {...field} disabled={isSubmitting} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea {...field} disabled={isSubmitting} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="priority"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Priority</FormLabel>
                <FormControl>
                  <Select 
                    disabled={isSubmitting}
                    value={field.value}
                    onValueChange={field.onChange}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status</FormLabel>
                <FormControl>
                  <Select 
                    disabled={isSubmitting} 
                    value={field.value}
                    onValueChange={field.onChange}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="backlog">Backlog</SelectItem>
                      <SelectItem value="in-progress">In Progress</SelectItem>
                      <SelectItem value="validation">Validation</SelectItem>
                      <SelectItem value="done">Done</SelectItem>
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="estimated_minutes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Estimated Minutes</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    {...field} 
                    onChange={e => field.onChange(parseInt(e.target.value) || 0)}
                    disabled={isSubmitting} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="actual_minutes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Actual Minutes</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    {...field} 
                    onChange={e => {
                      const value = e.target.value !== "" ? parseInt(e.target.value) : null;
                      field.onChange(value);
                    }}
                    disabled={isSubmitting} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="end_time"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Due Date</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                        disabled={isSubmitting}
                      >
                        {field.value ? (
                          format(new Date(field.value), "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value ? new Date(field.value) : undefined}
                      onSelect={(date) => field.onChange(date ? date.toISOString() : null)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category</FormLabel>
                <FormControl>
                  <Input 
                    {...field} 
                    value={field.value || ""}
                    onChange={e => field.onChange(e.target.value || null)}
                    disabled={isSubmitting}
                    placeholder="Enter a category" 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Button type="submit" disabled={isSubmitting} className="w-full">
          {task ? "Update Task" : "Create Task"}
        </Button>
      </form>
    </Form>
  );
}
