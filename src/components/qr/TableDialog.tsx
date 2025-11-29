import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";

const tableSchema = z.object({
  name: z.string().min(1, "Table name is required"),
  is_active: z.boolean().default(true),
});

type TableFormValues = z.infer<typeof tableSchema>;

interface TableDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  table: any | null;
  onSave: (data: TableFormValues) => void;
}

export const TableDialog = ({ open, onOpenChange, table, onSave }: TableDialogProps) => {
  const form = useForm<TableFormValues>({
    resolver: zodResolver(tableSchema),
    defaultValues: {
      name: "",
      is_active: true,
    },
  });

  useEffect(() => {
    if (table) {
      form.reset({
        name: table.name,
        is_active: table.is_active ?? true,
      });
    } else {
      form.reset({
        name: "",
        is_active: true,
      });
    }
  }, [table, form]);

  const handleSubmit = (data: TableFormValues) => {
    onSave(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{table ? "Edit Table" : "Add New Table"}</DialogTitle>
          <DialogDescription>
            {table
              ? "Update the table information"
              : "Create a new table and generate a QR code"}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Table Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Table 1, VIP 2, Patio A..." {...field} />
                  </FormControl>
                  <FormDescription>
                    A unique name to identify this table
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="is_active"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border border-border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Active</FormLabel>
                    <FormDescription>
                      Enable or disable this table for customer orders
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" className="gradient-primary">
                {table ? "Update" : "Create"} Table
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
