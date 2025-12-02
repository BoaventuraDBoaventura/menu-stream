import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Upload, X, Store, Loader2 } from "lucide-react";

interface LogoUploadProps {
  restaurantId: string;
  currentLogoUrl: string | null;
  onLogoUpdate: (newUrl: string | null) => void;
}

export const LogoUpload = ({ restaurantId, currentLogoUrl, onLogoUpdate }: LogoUploadProps) => {
  const [uploading, setUploading] = useState(false);
  const [removing, setRemoving] = useState(false);
  const { toast } = useToast();

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Formato inválido",
        description: "Por favor, selecione uma imagem (JPG, PNG, WEBP)",
        variant: "destructive"
      });
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: "Arquivo muito grande",
        description: "A imagem deve ter no máximo 2MB",
        variant: "destructive"
      });
      return;
    }

    setUploading(true);
    try {
      // Remove old logo if exists
      if (currentLogoUrl) {
        const oldPath = currentLogoUrl.split("/").pop();
        if (oldPath) {
          await supabase.storage.from("restaurant-logos").remove([`${restaurantId}/${oldPath}`]);
        }
      }

      // Upload new logo
      const fileExt = file.name.split(".").pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `${restaurantId}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("restaurant-logos")
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from("restaurant-logos")
        .getPublicUrl(filePath);

      // Update restaurant record
      const { error: updateError } = await supabase
        .from("restaurants")
        .update({ logo_url: publicUrl })
        .eq("id", restaurantId);

      if (updateError) throw updateError;

      onLogoUpdate(publicUrl);
      toast({
        title: "Logo atualizado",
        description: "A logo do restaurante foi atualizada com sucesso"
      });
    } catch (error: any) {
      console.error("Error uploading logo:", error);
      toast({
        title: "Erro ao enviar",
        description: error.message || "Não foi possível enviar a imagem",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  }, [restaurantId, currentLogoUrl, onLogoUpdate, toast]);

  const handleRemoveLogo = async () => {
    if (!currentLogoUrl) return;

    setRemoving(true);
    try {
      // Remove from storage
      const pathParts = currentLogoUrl.split("/restaurant-logos/");
      if (pathParts.length > 1) {
        const filePath = pathParts[1];
        await supabase.storage.from("restaurant-logos").remove([filePath]);
      }

      // Update restaurant record
      const { error } = await supabase
        .from("restaurants")
        .update({ logo_url: null })
        .eq("id", restaurantId);

      if (error) throw error;

      onLogoUpdate(null);
      toast({
        title: "Logo removida",
        description: "A logo do restaurante foi removida"
      });
    } catch (error: any) {
      console.error("Error removing logo:", error);
      toast({
        title: "Erro ao remover",
        description: error.message || "Não foi possível remover a logo",
        variant: "destructive"
      });
    } finally {
      setRemoving(false);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".jpg", ".jpeg", ".png", ".webp"]
    },
    maxFiles: 1,
    disabled: uploading
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Logo do Restaurante</CardTitle>
        <CardDescription>
          Faça upload da logo do seu restaurante. Recomendamos uma imagem quadrada de pelo menos 200x200 pixels.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current Logo Preview */}
        <div className="flex items-center gap-4">
          {currentLogoUrl ? (
            <div className="relative">
              <img
                src={currentLogoUrl}
                alt="Logo do restaurante"
                className="h-24 w-24 rounded-lg object-cover border"
              />
              <Button
                variant="destructive"
                size="icon"
                className="absolute -top-2 -right-2 h-6 w-6"
                onClick={handleRemoveLogo}
                disabled={removing}
              >
                {removing ? <Loader2 className="h-3 w-3 animate-spin" /> : <X className="h-3 w-3" />}
              </Button>
            </div>
          ) : (
            <div className="h-24 w-24 rounded-lg bg-muted flex items-center justify-center border">
              <Store className="h-10 w-10 text-muted-foreground" />
            </div>
          )}

          {/* Upload Dropzone */}
          <div
            {...getRootProps()}
            className={`flex-1 border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
              isDragActive ? "border-primary bg-primary/5" : "border-muted-foreground/25 hover:border-primary/50"
            } ${uploading ? "pointer-events-none opacity-50" : ""}`}
          >
            <input {...getInputProps()} />
            {uploading ? (
              <div className="flex flex-col items-center gap-2">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">Enviando...</p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <Upload className="h-8 w-8 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  {isDragActive
                    ? "Solte a imagem aqui"
                    : "Arraste uma imagem ou clique para selecionar"}
                </p>
                <p className="text-xs text-muted-foreground">JPG, PNG ou WEBP (máx. 2MB)</p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
