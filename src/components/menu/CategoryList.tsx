import { useState } from "react";
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { GripVertical, Pencil, Trash2, Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Category {
  id: string;
  name: string;
  description: string | null;
  position: number;
  item_count?: number;
}

interface CategoryListProps {
  menuId: string;
  categories: Category[];
  onCategorySelect: (categoryId: string) => void;
  selectedCategoryId: string | null;
  onRefresh: () => void;
  onEdit: (category: Category) => void;
}

const SortableCategory = ({ 
  category, 
  isSelected, 
  onSelect, 
  onEdit, 
  onDelete 
}: { 
  category: Category; 
  isSelected: boolean;
  onSelect: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: category.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="mb-2">
      <Card 
        className={`cursor-pointer transition-smooth ${
          isSelected ? "ring-2 ring-primary" : "hover:shadow-medium"
        }`}
        onClick={onSelect}
      >
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <button
              className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground"
              {...attributes}
              {...listeners}
            >
              <GripVertical className="h-5 w-5" />
            </button>
            <div className="flex-1">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <h4 className="font-semibold">{category.name}</h4>
                  {category.item_count !== undefined && (
                    <Badge variant="secondary" className="shrink-0">{category.item_count} items</Badge>
                  )}
                </div>
              {category.description && (
                <p className="text-sm text-muted-foreground mt-1">{category.description}</p>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); onEdit(); }}>
                <Pencil className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); onDelete(); }}>
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export const CategoryList = ({ 
  menuId, 
  categories, 
  onCategorySelect, 
  selectedCategoryId,
  onRefresh,
  onEdit
}: CategoryListProps) => {
  const [items, setItems] = useState(categories);
  const { toast } = useToast();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = async (event: any) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      const oldIndex = items.findIndex((item) => item.id === active.id);
      const newIndex = items.findIndex((item) => item.id === over.id);

      const newItems = arrayMove(items, oldIndex, newIndex);
      setItems(newItems);

      // Update positions in database
      try {
        const updates = newItems.map((item, index) => ({
          id: item.id,
          position: index,
        }));

        for (const update of updates) {
          await supabase
            .from("categories")
            .update({ position: update.position })
            .eq("id", update.id);
        }

        toast({
          title: "Order updated",
          description: "Category order has been saved.",
        });
      } catch (error: any) {
        toast({
          title: "Error updating order",
          description: error.message,
          variant: "destructive",
        });
        setItems(categories); // Revert on error
      }
    }
  };

  const handleDelete = async (categoryId: string) => {
    try {
      const { error } = await supabase
        .from("categories")
        .delete()
        .eq("id", categoryId);

      if (error) throw error;

      toast({
        title: "Category deleted",
        description: "Category has been removed.",
      });

      onRefresh();
    } catch (error: any) {
      toast({
        title: "Error deleting category",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <div>
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={items.map((c) => c.id)} strategy={verticalListSortingStrategy}>
          {items.map((category) => (
            <SortableCategory
              key={category.id}
              category={category}
              isSelected={selectedCategoryId === category.id}
              onSelect={() => onCategorySelect(category.id)}
              onEdit={() => onEdit(category)}
              onDelete={() => handleDelete(category.id)}
            />
          ))}
        </SortableContext>
      </DndContext>
    </div>
  );
};
