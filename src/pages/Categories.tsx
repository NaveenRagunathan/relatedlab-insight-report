import { CategoryForm } from "@/components/categories/CategoryForm";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Category, useCategories } from "@/hooks/useCategories";
import { Edit, PlusCircle, Trash2 } from "lucide-react";
import { useState } from "react";

export default function Categories() {
  const { categories, deleteCategory } = useCategories();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editCategory, setEditCategory] = useState<Category | null>(null);

  const handleDeleteCategory = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this category?")) {
      await deleteCategory.mutateAsync(id);
    }
  };

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Categories</h2>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <PlusCircle className="h-4 w-4 mr-2" />
          New Category
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {categories.map((category) => (
          <Card key={category.id}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: category.color }}
                  />
                  <span className="font-medium">{category.name}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setEditCategory(category)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeleteCategory(category.id)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Category</DialogTitle>
          </DialogHeader>
          <CategoryForm onSuccess={() => setIsCreateDialogOpen(false)} />
        </DialogContent>
      </Dialog>

      <Dialog open={!!editCategory} onOpenChange={() => setEditCategory(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Category</DialogTitle>
          </DialogHeader>
          {editCategory && (
            <CategoryForm
              category={editCategory}
              onSuccess={() => setEditCategory(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
} 