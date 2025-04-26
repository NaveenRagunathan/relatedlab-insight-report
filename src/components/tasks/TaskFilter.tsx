import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useCategories } from "@/hooks/useCategories";
import { TaskPriority, TaskStatus } from "@/types/task";
import { useState } from "react";

interface TaskFilterProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onFilter: (filters: TaskFilters) => void;
}

export interface TaskFilters {
  status?: TaskStatus;
  priority?: TaskPriority;
  category?: string;
}

export function TaskFilter({ open, onOpenChange, onFilter }: TaskFilterProps) {
  const { categories } = useCategories();
  const [filters, setFilters] = useState<TaskFilters>({});

  const handleFilter = () => {
    onFilter(filters);
    onOpenChange(false);
  };

  const handleClear = () => {
    setFilters({});
    onFilter({});
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Filter Tasks</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Status</Label>
            <Select
              value={filters.status}
              onValueChange={(value) =>
                setFilters({ ...filters, status: value as TaskStatus })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="not-started">Not Started</SelectItem>
                <SelectItem value="in-progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Priority</Label>
            <Select
              value={filters.priority}
              onValueChange={(value) =>
                setFilters({ ...filters, priority: value as TaskPriority })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="urgent">Urgent</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="normal">Normal</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Category</Label>
            <Select
              value={filters.category}
              onValueChange={(value) =>
                setFilters({ ...filters, category: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.name}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter className="flex justify-between">
          <Button variant="outline" onClick={handleClear}>
            Clear Filters
          </Button>
          <Button onClick={handleFilter}>Apply Filters</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 