import { useRef } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, Edit, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface QRCodeDisplayProps {
  table: any;
  restaurant: any;
  onEdit: (table: any) => void;
  onDelete: (tableId: string) => void;
}

export const QRCodeDisplay = ({ table, restaurant, onEdit, onDelete }: QRCodeDisplayProps) => {
  const { toast } = useToast();
  const qrRef = useRef<HTMLDivElement>(null);

  // Generate the URL that the QR code will point to
  const qrUrl = `${window.location.origin}/menu/${restaurant.slug}?table=${table.qr_code_token}`;

  const downloadAsPNG = () => {
    const svg = qrRef.current?.querySelector("svg");
    if (!svg) return;

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const img = new Image();

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.fillStyle = "white";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);

      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          const link = document.createElement("a");
          link.download = `${restaurant.slug}-${table.name}-qr.png`;
          link.href = url;
          link.click();
          URL.revokeObjectURL(url);

          toast({
            title: "QR Code downloaded",
            description: "PNG file saved successfully",
          });
        }
      });
    };

    img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgData)));
  };

  const downloadAsSVG = () => {
    const svg = qrRef.current?.querySelector("svg");
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const blob = new Blob([svgData], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.download = `${restaurant.slug}-${table.name}-qr.svg`;
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);

    toast({
      title: "QR Code downloaded",
      description: "SVG file saved successfully",
    });
  };

  return (
    <div className="space-y-4">
      {/* QR Code Display */}
      <div className="relative bg-card border border-border rounded-lg p-6 flex flex-col items-center">
        {/* Logo overlay */}
        {restaurant.logo_url && (
          <div className="absolute top-4 left-4 right-4 flex justify-center">
            <div className="bg-background rounded-lg p-2 shadow-medium">
              <img
                src={restaurant.logo_url}
                alt={restaurant.name}
                className="h-8 w-8 object-contain"
              />
            </div>
          </div>
        )}

        {/* QR Code */}
        <div ref={qrRef} className="mt-12 mb-4">
          <QRCodeSVG
            value={qrUrl}
            size={200}
            level="H"
            includeMargin
            fgColor="hsl(var(--foreground))"
            bgColor="hsl(var(--card))"
          />
        </div>

        {/* Table name */}
        <div className="text-center">
          <p className="font-semibold text-lg">{table.name}</p>
          <p className="text-xs text-muted-foreground mt-1">{restaurant.name}</p>
        </div>

        {/* Status badge */}
        <Badge
          variant={table.is_active ? "default" : "secondary"}
          className="mt-3"
        >
          {table.is_active ? "Active" : "Inactive"}
        </Badge>
      </div>

      {/* Action buttons */}
      <div className="space-y-2">
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={downloadAsPNG}
            className="w-full"
          >
            <Download className="h-4 w-4 mr-2" />
            PNG
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={downloadAsSVG}
            className="w-full"
          >
            <Download className="h-4 w-4 mr-2" />
            SVG
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEdit(table)}
            className="w-full"
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" size="sm" className="w-full">
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Table</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete {table.name}? This action cannot be undone.
                  The QR code will no longer work.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => onDelete(table.id)}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </div>
  );
};
