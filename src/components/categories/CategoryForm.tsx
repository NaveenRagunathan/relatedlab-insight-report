import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Category, useCategories } from "@/hooks/useCategories";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

interface CategoryFormProps {
  category?: Category;
  onSuccess?: () => void;
}

const categoryFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Must be a valid hex color"),
});

type CategoryFormData = z.infer<typeof categoryFormSchema>;

export function CategoryForm({ category, onSuccess }: CategoryFormProps) {
  const { createCategory, updateCategory } = useCategories();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<CategoryFormData>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: category
      ? {
          name: category.name,
          color: category.color,
        }
      : {
          name: "",
          color: "#000000",
        },
  });

  const onSubmit = async (data: CategoryFormData) => {
    setIsSubmitting(true);
    try {
      if (category) {
        await updateCategory.mutateAsync({ id: category.id, ...data });
      } else {
        // Ensure all required fields are present for category creation
        const newCategory = {
          name: data.name,
          color: data.color,
        };
        await createCategory.mutateAsync(newCategory);
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
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Category name" disabled={isSubmitting} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="color"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Color</FormLabel>
              <FormControl>
                <div className="flex items-center space-x-2">
                  <Input
                    type="color"
                    {...field}
                    className="w-12 h-12 p-1 rounded-md"
                    disabled={isSubmitting}
                  />
                  <Input
                    {...field}
                    placeholder="#000000"
                    className="flex-1"
                    disabled={isSubmitting}
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isSubmitting}>
          {category ? "Update" : "Create"} Category
        </Button>
      </form>
    </Form>
  );
} 