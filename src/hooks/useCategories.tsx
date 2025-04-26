import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export interface Category {
  id: string;
  name: string;
  color: string;
  created_at: string;
}

export function useCategories() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const {
    data: categories = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .order("name", { ascending: true });

      if (error) throw error;
      return data as Category[];
    },
  });

  const createCategory = useMutation({
    mutationFn: async (newCategory: Omit<Category, "id" | "created_at">) => {
      const { data, error } = await supabase
        .from("categories")
        .insert([newCategory])
        .select()
        .single();

      if (error) {
        if (error.code === "23505") {
          throw new Error("A category with this name already exists");
        }
        throw error;
      }
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      toast({
        title: "Success",
        description: "Category created successfully",
      });
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : "Failed to create category";
      toast({
        variant: "destructive",
        title: "Error",
        description: message,
      });
    },
  });

  const updateCategory = useMutation({
    mutationFn: async ({ id, ...category }: Partial<Category> & { id: string }) => {
      const { data, error } = await supabase
        .from("categories")
        .update(category)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      toast({
        title: "Success",
        description: "Category updated successfully",
      });
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update category",
      });
    },
  });

  const deleteCategory = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("categories").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      toast({
        title: "Success",
        description: "Category deleted successfully",
      });
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete category",
      });
    },
  });

  return {
    categories,
    isLoading,
    error,
    createCategory,
    updateCategory,
    deleteCategory,
  };
} 