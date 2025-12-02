import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useDropzone } from "react-dropzone";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Upload, X, Loader2, Plus, Trash2 } from "lucide-react";

const menuItemSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  description: z.string().optional(),
  price: z.coerce.number().min(0, "Price must be positive"),
  prep_time_minutes: z.coerce.number().min(1, "Prep time must be at least 1 minute").optional(),
  is_available: z.boolean(),
});

type MenuItemFormData = z.infer<typeof menuItemSchema>;

interface MenuItemDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  menuId: string;
  categoryId: string;
  item?: any;
  onSuccess: () => void;
}

export const MenuItemDialog = ({ 
  open, 
  onOpenChange, 
  menuId, 
  categoryId, 
  item,
  onSuccess 
}: MenuItemDialogProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [options, setOptions] = useState<Array<{ name: string; price: number }>>(
    []
  );
  const { toast } = useToast();

  const form = useForm<MenuItemFormData>({
    resolver: zodResolver(menuItemSchema),
    defaultValues: {
      name: "",
      description: "",
      price: 0,
      prep_time_minutes: 15,
      is_available: true,
    },
  });

  // Reset form when dialog opens or item changes
  useEffect(() => {
    if (open) {
      form.reset({
        name: item?.name || "",
        description: item?.description || "",
        price: item?.price || 0,
        prep_time_minutes: item?.prep_time_minutes || 15,
        is_available: item?.is_available ?? true,
      });
      setImagePreview(item?.image_url || null);
      setImageFile(null);
      setOptions(item?.options || []);
    }
  }, [open, item]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { 'image/*': ['.png', '.jpg', '.jpeg', '.webp'] },
    maxSize: 5 * 1024 * 1024,
    maxFiles: 1,
    onDrop: (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        const file = acceptedFiles[0];
        setImageFile(file);
        const reader = new FileReader();
        reader.onloadend = () => setImagePreview(reader.result as string);
        reader.readAsDataURL(file);
      }
    },
  });

  const uploadImage = async (): Promise<string | null> => {
    if (!imageFile) return item?.image_url || null;

    try {
      const fileExt = imageFile.name.split(".").pop();
      const fileName = `${menuId}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("menu-items")
        .upload(fileName, imageFile);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("menu-items")
        .getPublicUrl(fileName);

      return publicUrl;
    } catch (error: any) {
      console.error("Error uploading image:", error);
      return null;
    }
  };

  const onSubmit = async (data: MenuItemFormData) => {
    try {
      setIsSubmitting(true);

      const imageUrl = await uploadImage();

      const itemData = {
        menu_id: menuId,
        category_id: categoryId,
        name: data.name,
        description: data.description || null,
        price: data.price,
        image_url: imageUrl,
        prep_time_minutes: data.prep_time_minutes || null,
        is_available: data.is_available,
        options: options.length > 0 ? options : null,
      };

      if (item) {
        const { error } = await supabase
          .from("menu_items")
          .update(itemData)
          .eq("id", item.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("menu_items")
          .insert(itemData);

        if (error) throw error;
      }

      toast({
        title: item ? "Item updated" : "Item created",
        description: item ? "Menu item has been updated." : "Menu item has been created.",
      });

      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const addOption = () => {
    setOptions([...options, { name: "", price: 0 }]);
  };

  const removeOption = (index: number) => {
    setOptions(options.filter((_, i) => i !== index));
  };

  const updateOption = (index: number, field: "name" | "price", value: string | number) => {
    const newOptions = [...options];
    if (field === "name") {
      newOptions[index].name = value as string;
    } else {
      newOptions[index].price = value as number;
    }
    setOptions(newOptions);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{item ? "Edit Menu Item" : "Add Menu Item"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name *</Label>
            <Input id="name" {...form.register("name")} />
            {form.formState.errors.name && (
              <p className="text-sm text-destructive">{form.formState.errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" {...form.register("description")} rows={3} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price">Price *</Label>
              <Input id="price" type="number" step="0.01" {...form.register("price")} />
              {form.formState.errors.price && (
                <p className="text-sm text-destructive">{form.formState.errors.price.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="prep_time">Prep Time (minutes)</Label>
              <Input id="prep_time" type="number" {...form.register("prep_time_minutes")} />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Image</Label>
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-smooth ${
                isDragActive ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
              }`}
            >
              <input {...getInputProps()} />
              {imagePreview ? (
                <div className="space-y-2">
                  <img src={imagePreview} alt="Preview" className="max-h-40 mx-auto rounded-lg" />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      setImageFile(null);
                      setImagePreview(null);
                    }}
                  >
                    <X className="h-4 w-4 mr-2" />
                    Remove
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  <Upload className="h-10 w-10 mx-auto text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    {isDragActive ? "Drop image here" : "Drag & drop or click to select"}
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Options (sizes, extras)</Label>
              <Button type="button" variant="outline" size="sm" onClick={addOption}>
                <Plus className="h-4 w-4 mr-2" />
                Add Option
              </Button>
            </div>
            {options.map((option, index) => (
              <div key={index} className="flex items-center gap-2">
                <Input
                  placeholder="Option name (e.g., Large)"
                  value={option.name}
                  onChange={(e) => updateOption(index, "name", e.target.value)}
                />
                <Input
                  type="number"
                  step="0.01"
                  placeholder="Extra price"
                  className="w-32"
                  value={option.price}
                  onChange={(e) => updateOption(index, "price", parseFloat(e.target.value) || 0)}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeOption(index)}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between py-2">
            <Label htmlFor="is_available">Available</Label>
            <Switch
              id="is_available"
              checked={form.watch("is_available")}
              onCheckedChange={(checked) => form.setValue("is_available", checked)}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" className="gradient-primary" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                item ? "Update Item" : "Create Item"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
