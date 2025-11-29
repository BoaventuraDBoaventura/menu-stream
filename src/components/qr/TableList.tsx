import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { QRCodeDisplay } from "./QRCodeDisplay";

interface TableListProps {
  tables: any[];
  restaurant: any;
  onEdit: (table: any) => void;
  onDelete: (tableId: string) => void;
}

export const TableList = ({ tables, restaurant, onEdit, onDelete }: TableListProps) => {
  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      {tables.map((table) => (
        <Card key={table.id} className="overflow-hidden">
          <CardHeader className="bg-muted/50">
            <CardTitle className="text-lg">{table.name}</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <QRCodeDisplay
              table={table}
              restaurant={restaurant}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
