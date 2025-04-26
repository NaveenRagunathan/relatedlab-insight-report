import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useTasks } from "@/hooks/useTasks";
import { cn } from "@/lib/utils"; // Add this import
import { Task } from "@/types/task";
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from 'zod';

// Define categories (replace with dynamic fetching if needed)
const availableCategories = [
  { value: "feature", label: "Feature Request" },
  { value: "bug", label: "Bug Report" },
  { value: "chore", label: "Chore/Maintenance" },
  { value: "documentation", label: "Documentation" },
  { value: "research", label: "Research" },
];

interface TaskFormProps {
  task?: Task;
  onSuccess?: () => void;
}

// Define Zod schema for validation
const taskFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().nullable(),
  status: z.enum(["backlog", "in-progress", "validation", "done"]), // Use TaskStatus values
  priority: z.enum(["urgent", "high", "normal", "low"]), // Use TaskPriority values
  estimated_minutes: z.number().int().positive().nullable(),
  actual_minutes: z.number().int().positive().nullable(),
  start_time: z.string().datetime({ offset: true }).nullable(), // ISO 8601 string
  end_time: z.string().datetime({ offset: true }).nullable(), // ISO 8601 string
  color: z.string().nullable(), // Could add regex for hex color if needed
  category: z.string().nullable(),
  user_id: z.string().uuid(), // Should be set automatically, not part of form editing usually
});

// Infer the TS type from the schema
type TaskFormData = z.infer<typeof taskFormSchema>;

export function TaskForm({ task, onSuccess }: TaskFormProps) {
  const { createTask, updateTask } = useTasks();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const defaultEndTime = task?.end_time ? new Date(task.end_time) : undefined;
  const defaultStartTime = task?.start_time ? new Date(task.start_time) : undefined;

  const form = useForm<TaskFormData>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: task 
      ? {
          ...task,
          estimated_minutes: task.estimated_minutes ?? null,
          start_time: task.start_time, 
          end_time: task.end_time,
        }
      : {
          title: "",
          description: "",
          status: "backlog",
          priority: "normal",
          estimated_minutes: null,
          actual_minutes: null,
          start_time: null,
          end_time: null,
          color: null,
          category: null,
          user_id: "",
        },
  });

  const onSubmit = async (data: TaskFormData) => {
    setIsSubmitting(true);
    try {
      if (task) {
        const { user_id, ...updateData } = data;
        await updateTask.mutateAsync({ id: task.id, ...updateData });
      } else {
        const { user_id, ...createData } = data; 
        await createTask.mutateAsync(createData as Omit<Task, 'id' | 'created_at' | 'user_id'>);
        form.reset();
      }
      onSuccess?.();
    } catch (error) {
      console.error("Form submission error:", error);
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
                <Input {...field} placeholder="Task title" disabled={isSubmitting} />
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
              <FormLabel>Description <span className="text-muted-foreground text-xs">(Optional)</span></FormLabel>
              <FormControl>
                <Textarea 
                  {...field} 
                  value={field.value ?? ''} 
                  onChange={e => field.onChange(e.target.value || null)} 
                  placeholder="Add more details..."
                  disabled={isSubmitting} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category <span className="text-muted-foreground text-xs">(Optional)</span></FormLabel>
              <FormControl>
                <Select
                   disabled={isSubmitting}
                   value={field.value ?? ""}
                   onValueChange={(value) => field.onChange(value || null)}
                 >
                   <SelectTrigger>
                     <SelectValue placeholder="Select a category" />
                   </SelectTrigger>
                   <SelectContent>
                      <SelectItem value="">-- None --</SelectItem> 
                      {availableCategories.map(cat => (
                        <SelectItem key={cat.value} value={cat.value}>
                          {cat.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                 </Select>
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
                <FormLabel>Estimated Minutes <span className="text-muted-foreground text-xs">(Optional)</span></FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    {...field}
                    value={field.value ?? ''} 
                    onChange={e => {
                      const val = e.target.value;
                      field.onChange(val === '' ? null : parseInt(val, 10));
                    }} 
                    min="0"
                    placeholder="e.g., 60"
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
                <FormLabel>Actual Minutes <span className="text-muted-foreground text-xs">(Optional)</span></FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    {...field} 
                    value={field.value ?? ''} 
                    onChange={e => {
                      const val = e.target.value;
                      field.onChange(val === '' ? null : parseInt(val, 10));
                    }} 
                    min="0"
                    placeholder="e.g., 45"
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
                <FormLabel>Due Date <span className="text-muted-foreground text-xs">(Optional)</span></FormLabel>
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
                      disabled={(date) => date < new Date("1900-01-01") || isSubmitting}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end pt-4">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (task ? "Updating..." : "Creating...") : (task ? "Update Task" : "Create Task")}
          </Button>
        </div>
      </form>
    </Form>
  );
}
